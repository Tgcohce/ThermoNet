package org.thermonet.android

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.work.*
import dagger.hilt.android.AndroidEntryPoint
import org.thermonet.android.service.SensorReadingWorker
import org.thermonet.android.ui.theme.ThermoNetTheme
import org.thermonet.android.viewmodel.MainViewModel
import java.util.concurrent.TimeUnit

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions.all { it.value }) {
            startSensorCollection()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        requestPermissions()
        
        setContent {
            ThermoNetTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ThermoNetApp()
                }
            }
        }
    }

    private fun requestPermissions() {
        val permissions = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.ACCESS_BACKGROUND_LOCATION
        )
        
        if (permissions.any { 
            ActivityCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }) {
            permissionLauncher.launch(permissions)
        } else {
            startSensorCollection()
        }
    }

    private fun startSensorCollection() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val sensorWork = PeriodicWorkRequestBuilder<SensorReadingWorker>(
            10, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setInitialDelay(1, TimeUnit.MINUTES)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "sensor_reading_work",
            ExistingPeriodicWorkPolicy.UPDATE,
            sensorWork
        )
    }
}

@Composable
fun ThermoNetApp(viewModel: MainViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "ThermoNet Oracle",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // Status Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Status",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                StatusRow("Device ID", uiState.deviceId ?: "Not initialized")
                StatusRow("Last Reading", uiState.lastReadingTime ?: "Never")
                StatusRow("Total Readings", uiState.totalReadings.toString())
                StatusRow("TEMP Balance", "${uiState.tempBalance} TEMP")
                StatusRow("BONK Balance", "${uiState.bonkBalance} BONK")
                StatusRow("Reputation", "${uiState.reputation}/10000")
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Collection Active")
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .background(
                                if (uiState.isCollecting) Color.Green else Color.Red,
                                shape = androidx.compose.foundation.shape.CircleShape
                            )
                    )
                }
            }
        }
        
        // Recent Readings
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Recent Readings",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                LazyColumn {
                    items(uiState.recentReadings) { reading ->
                        ReadingItem(reading)
                    }
                }
            }
        }
    }
}

@Composable
fun StatusRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 14.sp)
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun ReadingItem(reading: SensorReading) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp)
        ) {
            Text(
                text = "${reading.temperature}°C • ${reading.pressure} hPa",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = "Hex: ${reading.hexId} • ${reading.timestamp}",
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

data class SensorReading(
    val temperature: Float,
    val pressure: Float,
    val hexId: String,
    val timestamp: String
)