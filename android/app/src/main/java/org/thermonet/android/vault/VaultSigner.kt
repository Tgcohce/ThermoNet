package org.thermonet.android.vault

import com.solanamobile.seedvault.SeedVault
import com.solanamobile.seedvault.SeedVaultError
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.thermonet.android.data.SensorReading
import java.security.MessageDigest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VaultSigner @Inject constructor() {
    
    private var seedVault: SeedVault? = null
    
    suspend fun initialize(): Boolean = withContext(Dispatchers.IO) {
        try {
            seedVault = SeedVault.getInstance()
            true
        } catch (e: SeedVaultError) {
            false
        }
    }
    
    suspend fun signReading(reading: SensorReading): ByteArray = withContext(Dispatchers.IO) {
        val vault = seedVault ?: throw IllegalStateException("SeedVault not initialized")
        
        val message = createSigningMessage(reading)
        val messageHash = MessageDigest.getInstance("SHA-256").digest(message)
        
        try {
            vault.signMessage(messageHash)
        } catch (e: SeedVaultError) {
            throw RuntimeException("Failed to sign reading", e)
        }
    }
    
    suspend fun getDevicePublicKey(): ByteArray = withContext(Dispatchers.IO) {
        val vault = seedVault ?: throw IllegalStateException("SeedVault not initialized")
        
        try {
            vault.getPublicKey()
        } catch (e: SeedVaultError) {
            throw RuntimeException("Failed to get public key", e)
        }
    }
    
    private fun createSigningMessage(reading: SensorReading): ByteArray {
        val hexId = calculateHexId(reading.latitude, reading.longitude)
        
        return buildString {
            append("thermonet_reading:")
            append("hex_id=${hexId.contentToString()}")
            append("temp=${(reading.temperature * 100).toInt()}")
            append("pressure=${(reading.pressure * 100).toInt()}")
            append("timestamp=${reading.timestamp}")
            append("nonce=${reading.nonce}")
        }.toByteArray()
    }
    
    private fun calculateHexId(lat: Double, lng: Double): ByteArray {
        // H3 hex calculation would be done here
        // For now, return a mock hex ID based on coordinates
        val latInt = (lat * 1000000).toLong()
        val lngInt = (lng * 1000000).toLong()
        val combined = (latInt shl 32) or (lngInt and 0xFFFFFFFF)
        
        return ByteArray(8) { i ->
            (combined shr (i * 8)).toByte()
        }
    }
}