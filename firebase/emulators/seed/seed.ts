// carrier-ops-hub/firebase/emulators/seed/seed.ts

import admin from 'firebase-admin'
import { fixtures, testUserClaims } from './fixtures.js'

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

admin.initializeApp({ projectId: 'carrier-ops-hub' })

const db = admin.firestore()
const auth = admin.auth()

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

        // 8. Create Documents
        console.log('\n📄 Creating documents...')
        for (const doc of fixtures.documents) {
            await db.collection('documents').doc(doc.id).set(doc)
            console.log(`   ✓ Created document: ${doc.fileName} (${doc.type})`)
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
