package org.thermonet.android.solana

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.thermonet.android.data.SensorReading
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SolanaClient @Inject constructor() {
    
    private val rpcService = Retrofit.Builder()
        .baseUrl("https://api.mainnet-beta.solana.com/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(SolanaRpcService::class.java)
    
    suspend fun submitReading(reading: SensorReading, signature: ByteArray) = withContext(Dispatchers.IO) {
        val transaction = createSubmitReadingTransaction(reading, signature)
        rpcService.sendTransaction(transaction)
    }
    
    suspend fun queryTileData(hexId: String): TileData = withContext(Dispatchers.IO) {
        val request = QueryTileRequest(hexId = hexId)
        rpcService.queryTile(request)
    }
    
    private fun createSubmitReadingTransaction(reading: SensorReading, signature: ByteArray): SendTransactionRequest {
        // This would create a proper Solana transaction
        // For now, return a mock structure
        return SendTransactionRequest(
            method = "sendTransaction",
            params = listOf(
                mapOf(
                    "recent_blockhash" to "mock_blockhash",
                    "fee_payer" to "mock_fee_payer",
                    "instructions" to listOf(
                        mapOf(
                            "program_id" to "ThermoNET1111111111111111111111111111111111",
                            "accounts" to listOf("device_account", "hex_tile_account"),
                            "data" to createInstructionData(reading, signature)
                        )
                    )
                )
            )
        )
    }
    
    private fun createInstructionData(reading: SensorReading, signature: ByteArray): String {
        // Serialize instruction data for submit_reading
        val hexId = calculateHexId(reading.latitude, reading.longitude)
        val data = mutableListOf<Byte>()
        
        // Instruction discriminator (first 8 bytes)
        data.addAll(listOf(0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08))
        
        // Hex ID (8 bytes)
        data.addAll(hexId.toList())
        
        // Temperature (2 bytes, * 100 for precision)
        val tempInt = (reading.temperature * 100).toInt().toShort()
        data.addAll(tempInt.toByteArray().toList())
        
        // Pressure (4 bytes, * 100 for precision)
        val pressureInt = (reading.pressure * 100).toInt()
        data.addAll(pressureInt.toByteArray().toList())
        
        // Timestamp (8 bytes)
        data.addAll(reading.timestamp.toByteArray().toList())
        
        // GPS accuracy (2 bytes)
        val accuracyInt = (reading.accuracy * 100).toInt().toShort()
        data.addAll(accuracyInt.toByteArray().toList())
        
        // Signature (64 bytes)
        data.addAll(signature.toList())
        
        // Nonce (8 bytes)
        data.addAll(reading.nonce.toByteArray().toList())
        
        return android.util.Base64.encodeToString(data.toByteArray(), android.util.Base64.DEFAULT)
    }
    
    private fun calculateHexId(lat: Double, lng: Double): ByteArray {
        // H3 calculation would go here
        val latInt = (lat * 1000000).toLong()
        val lngInt = (lng * 1000000).toLong()
        val combined = (latInt shl 32) or (lngInt and 0xFFFFFFFF)
        
        return ByteArray(8) { i ->
            (combined shr (i * 8)).toByte()
        }
    }
}

interface SolanaRpcService {
    @POST(".")
    suspend fun sendTransaction(@Body request: SendTransactionRequest): SendTransactionResponse
    
    @POST(".")
    suspend fun queryTile(@Body request: QueryTileRequest): TileData
}

data class SendTransactionRequest(
    val method: String,
    val params: List<Any>,
    val id: Int = 1,
    val jsonrpc: String = "2.0"
)

data class SendTransactionResponse(
    val result: String?,
    val error: Any?
)

data class QueryTileRequest(
    val method: String = "queryTile",
    val params: Map<String, String>,
    val id: Int = 1,
    val jsonrpc: String = "2.0"
) {
    constructor(hexId: String) : this(
        params = mapOf("hex_id" to hexId)
    )
}

data class TileData(
    val hexId: String,
    val medianTemp: Float,
    val lastUpdated: Long,
    val confidence: Int,
    val sampleCount: Int
)

// Extension functions for type conversion
private fun Short.toByteArray(): ByteArray = byteArrayOf(
    (this.toInt() and 0xFF).toByte(),
    ((this.toInt() shr 8) and 0xFF).toByte()
)

private fun Int.toByteArray(): ByteArray = byteArrayOf(
    (this and 0xFF).toByte(),
    ((this shr 8) and 0xFF).toByte(),
    ((this shr 16) and 0xFF).toByte(),
    ((this shr 24) and 0xFF).toByte()
)

private fun Long.toByteArray(): ByteArray = byteArrayOf(
    (this and 0xFF).toByte(),
    ((this shr 8) and 0xFF).toByte(),
    ((this shr 16) and 0xFF).toByte(),
    ((this shr 24) and 0xFF).toByte(),
    ((this shr 32) and 0xFF).toByte(),
    ((this shr 40) and 0xFF).toByte(),
    ((this shr 48) and 0xFF).toByte(),
    ((this shr 56) and 0xFF).toByte()
)