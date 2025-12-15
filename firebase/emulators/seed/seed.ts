// carrier-ops-hub/firebase/emulators/seed/seed.ts

import admin from 'firebase-admin'
import { randomUUID } from 'crypto'
import { fixtures, testUserClaims } from './fixtures/index.js'

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

admin.initializeApp({ projectId: 'carrier-ops-hub', storageBucket: 'carrier-ops-hub-test.appspot.com' })

const db = admin.firestore()
const auth = admin.auth()
const storage = admin.storage()

// Check if Storage emulator is configured
const storageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST
if (!storageEmulatorHost) {
    console.warn('\n⚠️  WARNING: FIREBASE_STORAGE_EMULATOR_HOST not set.')
    console.warn('   Storage uploads will be skipped.')
    console.warn('   Set to "127.0.0.1:9199" (no protocol) to enable.\n')
}

/**
 * Generate a minimal valid PDF buffer (no external dependencies)
 * This is a basic PDF structure that most viewers can open
 */
function generatePdfBuffer(fileName: string): Buffer {
    const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(${fileName}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000304 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
398
%%EOF
`.trim()
    return Buffer.from(content, 'utf-8')
}

/**
 * Generate a minimal valid PNG buffer (1x1 transparent pixel)
 */
function generatePngBuffer(): Buffer {
    // 1x1 transparent PNG
    return Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x01, // width: 1
        0x00, 0x00, 0x00, 0x01, // height: 1
        0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
        0x1f, 0x15, 0xc4, 0x89, // CRC
        0x00, 0x00, 0x00, 0x0a, // IDAT length
        0x49, 0x44, 0x41, 0x54, // IDAT
        0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
        0x0d, 0x0a, 0x2d, 0xb4, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND length
        0x49, 0x45, 0x4e, 0x44, // IEND
        0xae, 0x42, 0x60, 0x82, // CRC
    ])
}

/**
 * Generate a minimal JPEG buffer (1x1 red pixel)
 */
function generateJpegBuffer(): Buffer {
    // Minimal 1x1 red JPEG
    return Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x03, 0x02, 0x02, 0x03, 0x02, 0x02, 0x03,
        0x03, 0x03, 0x03, 0x04, 0x03, 0x03, 0x04, 0x05, 0x08, 0x05, 0x05, 0x04, 0x04, 0x05, 0x0a, 0x07,
        0x07, 0x06, 0x08, 0x0c, 0x0a, 0x0c, 0x0c, 0x0b, 0x0a, 0x0b, 0x0b, 0x0d, 0x0e, 0x12, 0x10, 0x0d,
        0x0e, 0x11, 0x0e, 0x0b, 0x0b, 0x10, 0x16, 0x10, 0x11, 0x13, 0x14, 0x15, 0x15, 0x15, 0x0c, 0x0f,
        0x17, 0x18, 0x16, 0x14, 0x18, 0x12, 0x14, 0x15, 0x14, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14,
        0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x7f, 0x80, 0xff, 0xd9,
    ])
}

/**
 * Generate file buffer based on content type
 */
function generateFileBuffer(contentType: string, fileName: string): Buffer {
    if (contentType === 'application/pdf') {
        return generatePdfBuffer(fileName)
    } else if (contentType === 'image/png') {
        return generatePngBuffer()
    } else if (contentType === 'image/jpeg') {
        return generateJpegBuffer()
    } else {
        // Fallback: plain text
        return Buffer.from(`Test file: ${fileName}`, 'utf-8')
    }
}

/**
 * Upload a file to Storage emulator and return the working emulator URL
 */
async function uploadToStorage(doc: {
    id: string
    storagePath: string
    contentType: string
    fileName: string
}): Promise<{ url: string; size: number }> {
    if (!storageEmulatorHost) {
        // Skip upload if emulator not configured
        return { url: doc.fileName, size: 0 }
    }

    const fileBuffer = generateFileBuffer(doc.contentType, doc.fileName)
    const bucket = storage.bucket()
    const file = bucket.file(doc.storagePath)
    const downloadToken = randomUUID()

    // Upload file with metadata
    await file.save(fileBuffer, {
        contentType: doc.contentType,
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: downloadToken,
            },
        },
    })

    // Generate emulator URL
    const bucketName = bucket.name
    const encodedPath = encodeURIComponent(doc.storagePath)
    const url = `http://${storageEmulatorHost}/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`

    return { url, size: fileBuffer.length }
}


/**
 * Seed Firebase emulators with validated test data
 */
export async function seedEmulators() {
    console.log('\n🌱 Starting Firebase Emulator Seeding...\n')

    try {
        // 1. Create Auth users with custom claims
        console.log('👥 Creating Auth users...')
        for (const user of fixtures.users) {
            try {
                await auth.createUser({
                    uid: user.id,
                    email: user.email,
                    password: 'password123', // Test password
                    displayName: `${user.firstName} ${user.lastName}`,
                })

                // Set custom claims
                const claims = testUserClaims[user.id]
                if (claims) {
                    await auth.setCustomUserClaims(user.id, claims)
                }

                console.log(`   ✓ Created user: ${user.email} (${user.roles.join(', ')})`)
            } catch (error: unknown) {
                if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/uid-already-exists') {
                    console.log(`   ⊘ User already exists: ${user.email}`)
                } else {
                    throw error
                }
            }
        }

        // 2. Create Fleets
        console.log('\n🚛 Creating fleets...')
        for (const fleet of fixtures.fleets) {
            await db.collection('fleets').doc(fleet.id).set(fleet)
            console.log(`   ✓ Created fleet: ${fleet.name}`)
        }

        // 3. Create Users collection
        console.log('\n📋 Creating users collection...')
        for (const user of fixtures.users) {
            await db.collection('users').doc(user.id).set(user)
            console.log(`   ✓ Created user doc: ${user.email}`)
        }

        // 4. Create Drivers
        console.log('\n🚗 Creating drivers...')
        for (const driver of fixtures.drivers) {
            await db.collection('drivers').doc(driver.id).set(driver)
            console.log(`   ✓ Created driver: ${driver.firstName} ${driver.lastName}`)
        }

        // 5. Create Vehicles
        console.log('\n🚚 Creating vehicles...')
        for (const vehicle of fixtures.vehicles) {
            await db.collection('vehicles').doc(vehicle.id).set(vehicle)
            console.log(`   ✓ Created vehicle: ${vehicle.vehicleNumber}`)
        }

        // 6. Create Loads
        console.log('\n📦 Creating loads...')
        for (const load of fixtures.loads) {
            await db.collection('loads').doc(load.id).set(load)
            console.log(`   ✓ Created load: ${load.loadNumber} (${load.status})`)
        }

        // 7. Create Events
        console.log('\n📅 Creating events...')
        for (const event of fixtures.events) {
            await db.collection('events').doc(event.id).set(event)
            console.log(`   ✓ Created event: ${event.type} for load ${event.loadId}`)
        }

        // 8. Create Documents (with Storage uploads)
        console.log('\n📄 Creating documents...')
        let uploadedCount = 0
        for (const doc of fixtures.documents) {
            // Upload to Storage and get real emulator URL
            const { url, size } = await uploadToStorage(doc)

            // Only update url/size if Storage emulator is configured
            const docData = storageEmulatorHost
                ? {
                    ...doc,
                    url,
                    size,
                    updatedAt: Date.now(),
                }
                : {
                    ...doc,
                    updatedAt: Date.now(),
                }

            await db.collection('documents').doc(doc.id).set(docData)

            if (storageEmulatorHost) {
                console.log(`   ✓ Created document: ${doc.fileName} (${doc.type}) - uploaded to Storage`)
                uploadedCount++
            } else {
                console.log(`   ✓ Created document: ${doc.fileName} (${doc.type}) - Storage upload skipped`)
            }
        }

        // Print sample URL for verification
        if (storageEmulatorHost && fixtures.documents.length > 0) {
            const sampleDoc = fixtures.documents[0]
            const { url } = await uploadToStorage(sampleDoc)
            console.log(`\n   📋 Sample URL: ${url}`)
            console.log(`   📂 Storage path: ${sampleDoc.storagePath}`)
        }


        console.log('\n✅ Seed complete!\n')
        console.log('Summary:')
        console.log(`   - ${fixtures.fleets.length} fleets`)
        console.log(`   - ${fixtures.users.length} users (Auth + Firestore)`)
        console.log(`   - ${fixtures.drivers.length} drivers`)
        console.log(`   - ${fixtures.vehicles.length} vehicles`)
        console.log(`   - ${fixtures.loads.length} loads`)
        console.log(`   - ${fixtures.events.length} events`)
        console.log(`   - ${fixtures.documents.length} documents`)
        if (storageEmulatorHost) {
            console.log(`   - ${uploadedCount} files uploaded to Storage emulator`)
        } else {
            console.log(`   - 0 files uploaded (Storage emulator not configured)`)
        }
        console.log('\n🔐 Test Credentials:')
        console.log('   Email: owner@acme.test, dispatcher@acme.test, driver1@acme.test, etc.')
        console.log('   Password: password123\n')

    } catch (error) {
        console.error('\n❌ Seeding failed:', error)
        throw error
    }
}

// Run if called directly (ESM module check)
// In ESM, we need to check if this is the main module
const isMainModule = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')

if (isMainModule) {
    seedEmulators()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}
