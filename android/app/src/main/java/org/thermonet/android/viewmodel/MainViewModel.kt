package org.thermonet.android.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.thermonet.android.data.ReadingRepository
import org.thermonet.android.data.SensorReading
import org.thermonet.android.solana.SolanaClient
import org.thermonet.android.vault.VaultSigner
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val readingRepository: ReadingRepository,
    private val solanaClient: SolanaClient,
    private val vaultSigner: VaultSigner
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        observeReadings()
        initializeVault()
    }

    private fun observeReadings() {
        viewModelScope.launch {
            readingRepository.getRecentReadings().collect { readings ->
                _uiState.update { currentState ->
                    currentState.copy(
                        recentReadings = readings.take(10).map { reading ->
                            org.thermonet.android.SensorReading(
                                temperature = reading.temperature,
                                pressure = reading.pressure,
                                hexId = reading.hexId.takeIf { it.isNotEmpty() } ?: "Unknown",
                                timestamp = formatTimestamp(reading.timestamp)
                            )
                        },
                        totalReadings = readings.size,
                        lastReadingTime = readings.firstOrNull()?.let { formatTimestamp(it.timestamp) }
                    )
                }
            }
        }
    }

    private fun initializeVault() {
        viewModelScope.launch {
            val initialized = vaultSigner.initialize()
            if (initialized) {
                try {
                    val publicKey = vaultSigner.getDevicePublicKey()
                    val deviceId = android.util.Base64.encodeToString(
                        publicKey.take(8).toByteArray(), 
                        android.util.Base64.NO_WRAP
                    )
                    _uiState.update { it.copy(deviceId = deviceId, isCollecting = true) }
                } catch (e: Exception) {
                    _uiState.update { it.copy(isCollecting = false) }
                }
            }
        }
    }

    private fun formatTimestamp(timestamp: Long): String {
        val date = java.util.Date(timestamp * 1000)
        val formatter = java.text.SimpleDateFormat("MMM dd, HH:mm", java.util.Locale.getDefault())
        return formatter.format(date)
    }
}

data class MainUiState(
    val deviceId: String? = null,
    val isCollecting: Boolean = false,
    val lastReadingTime: String? = null,
    val totalReadings: Int = 0,
    val tempBalance: Long = 0,
    val bonkBalance: Long = 0,
    val reputation: Int = 5000,
    val recentReadings: List<org.thermonet.android.SensorReading> = emptyList()
)