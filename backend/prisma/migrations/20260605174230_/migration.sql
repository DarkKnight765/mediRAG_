-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "patientName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "appointmentType" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "reasonForVisit" TEXT NOT NULL,
    "symptoms" TEXT,
    "medicalHistory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "consultationFee" TEXT,
    "consultationMode" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "reminderSent24h" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent1h" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("address", "appointmentType", "consultationFee", "consultationMode", "createdAt", "date", "doctor", "email", "id", "latitude", "location", "longitude", "medicalHistory", "patientName", "phone", "reasonForVisit", "reminderSent1h", "reminderSent24h", "specialty", "status", "symptoms", "time", "updatedAt", "userId") SELECT "address", "appointmentType", "consultationFee", "consultationMode", "createdAt", "date", "doctor", "email", "id", "latitude", "location", "longitude", "medicalHistory", "patientName", "phone", "reasonForVisit", "reminderSent1h", "reminderSent24h", "specialty", "status", "symptoms", "time", "updatedAt", "userId" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
