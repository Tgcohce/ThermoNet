package org.thermonet.android.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import java.util.*

@Entity(tableName = "sensor_readings")
data class SensorReading(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val temperature: Float,
    val pressure: Float,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val timestamp: Long,
    val nonce: Long,
    val isSubmitted: Boolean = false,
    val submissionAttempts: Int = 0,
    val hexId: String = "",
    val signature: ByteArray? = null
) {
    fun toByteArray(): ByteArray {
        return buildString {
            append("THERMO:")
            append("${(temperature * 100).toInt()}:")
            append("${(pressure * 100).toInt()}:")
            append("$timestamp:")
            append("$nonce")
        }.toByteArray()
    }
}

@Dao
interface SensorReadingDao {
    @Query("SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 50")
    fun getRecentReadings(): Flow<List<SensorReading>>
    
    @Query("SELECT * FROM sensor_readings WHERE isSubmitted = 0 AND submissionAttempts < 3")
    suspend fun getPendingReadings(): List<SensorReading>
    
    @Insert
    suspend fun insert(reading: SensorReading)
    
    @Update
    suspend fun update(reading: SensorReading)
    
    @Query("UPDATE sensor_readings SET isSubmitted = 1 WHERE id = :id")
    suspend fun markAsSubmitted(id: String)
    
    @Query("UPDATE sensor_readings SET submissionAttempts = submissionAttempts + 1 WHERE id = :id")
    suspend fun incrementSubmissionAttempts(id: String)
    
    @Query("DELETE FROM sensor_readings WHERE timestamp < :cutoff")
    suspend fun deleteOldReadings(cutoff: Long)
}

@Database(
    entities = [SensorReading::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class ThermoNetDatabase : RoomDatabase() {
    abstract fun sensorReadingDao(): SensorReadingDao
}

class Converters {
    @TypeConverter
    fun fromByteArray(value: ByteArray?): String? {
        return value?.let { android.util.Base64.encodeToString(it, android.util.Base64.DEFAULT) }
    }

    @TypeConverter
    fun toByteArray(value: String?): ByteArray? {
        return value?.let { android.util.Base64.decode(it, android.util.Base64.DEFAULT) }
    }
}

class ReadingRepository @javax.inject.Inject constructor(
    private val dao: SensorReadingDao
) {
    fun getRecentReadings(): Flow<List<SensorReading>> = dao.getRecentReadings()
    
    suspend fun insertReading(reading: SensorReading) = dao.insert(reading)
    
    suspend fun markAsSubmitted(id: String) = dao.markAsSubmitted(id)
    
    suspend fun queueForLater(reading: SensorReading) {
        dao.incrementSubmissionAttempts(reading.id)
    }
    
    suspend fun getPendingReadings(): List<SensorReading> = dao.getPendingReadings()
    
    suspend fun cleanupOldReadings() {
        val cutoff = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000) // 7 days
        dao.deleteOldReadings(cutoff)
    }
}