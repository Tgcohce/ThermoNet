package org.thermonet.android.service

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.BatteryManager
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.thermonet.android.data.ReadingRepository
import org.thermonet.android.data.SensorReading
import org.thermonet.android.solana.SolanaClient
import org.thermonet.android.vault.VaultSigner
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

@HiltWorker
class SensorReadingWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val sensorService: SensorService,
    private val readingRepository: ReadingRepository,
    private val solanaClient: SolanaClient,
    private val vaultSigner: VaultSigner
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val reading = sensorService.takeSensorReading()
            val signature = vaultSigner.signReading(reading)
            
            try {
                solanaClient.submitReading(reading, signature)
                readingRepository.markAsSubmitted(reading.id)
            } catch (e: Exception) {
                readingRepository.queueForLater(reading)
                broadcastViaBLE(reading)
            }
            
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun broadcastViaBLE(reading: SensorReading) {
        val bluetoothManager = applicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val bluetoothAdapter = bluetoothManager.adapter
        val advertiser = bluetoothAdapter.bluetoothLeAdvertiser ?: return

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .setConnectable(false)
            .setTimeout(0)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceData(
                android.os.ParcelUuid.fromString("0000180F-0000-1000-8000-00805F9B34FB"),
                reading.toByteArray()
            )
            .build()

        advertiser.startAdvertising(settings, data, object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                // BLE broadcast started successfully
            }

            override fun onStartFailure(errorCode: Int) {
                // BLE broadcast failed
            }
        })
    }
}

class SensorService @AssistedInject constructor(
    private val context: Context,
    private val locationProvider: LocationProvider
) {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager

    suspend fun takeSensorReading(): SensorReading = withTimeout(30000) {
        val temperature = getBatteryTemperature()
        val pressure = getBarometricPressure()
        val location = locationProvider.getCurrentLocation()
        val timestamp = System.currentTimeMillis() / 1000
        
        SensorReading(
            temperature = temperature,
            pressure = pressure,
            latitude = location.latitude,
            longitude = location.longitude,
            accuracy = location.accuracy,
            timestamp = timestamp,
            nonce = generateNonce()
        )
    }

    private fun getBatteryTemperature(): Float {
        return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_TEMPERATURE) / 10.0f
    }

    private suspend fun getBarometricPressure(): Float = suspendCancellableCoroutine { continuation ->
        val pressureSensor = sensorManager.getDefaultSensor(Sensor.TYPE_PRESSURE)
        
        if (pressureSensor == null) {
            continuation.resumeWithException(IllegalStateException("No pressure sensor available"))
            return@suspendCancellableCoroutine
        }

        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                event?.let {
                    val pressure = it.values[0]
                    sensorManager.unregisterListener(this)
                    continuation.resume(pressure)
                }
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }

        sensorManager.registerListener(
            listener,
            pressureSensor,
            SensorManager.SENSOR_DELAY_NORMAL
        )

        continuation.invokeOnCancellation {
            sensorManager.unregisterListener(listener)
        }
    }

    private fun generateNonce(): Long {
        return System.currentTimeMillis() + kotlin.random.Random.nextLong(1000)
    }
}

class LocationProvider @AssistedInject constructor(
    private val context: Context
) {
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): Location = suspendCancellableCoroutine { continuation ->
        val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
        val isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

        if (!isGpsEnabled && !isNetworkEnabled) {
            continuation.resumeWithException(IllegalStateException("No location providers available"))
            return@suspendCancellableCoroutine
        }

        val provider = if (isGpsEnabled) LocationManager.GPS_PROVIDER else LocationManager.NETWORK_PROVIDER
        
        val listener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                locationManager.removeUpdates(this)
                continuation.resume(location)
            }
        }

        try {
            locationManager.requestSingleUpdate(provider, listener, null)
        } catch (e: SecurityException) {
            continuation.resumeWithException(e)
        }

        continuation.invokeOnCancellation {
            locationManager.removeUpdates(listener)
        }
    }
}