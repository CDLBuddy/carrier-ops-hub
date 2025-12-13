<!-- carrier-ops-hub/docs/product/terminology.md -->

# Terminology

This document defines key terms and concepts used in the Carrier Ops Hub.

## General Terms

**Carrier**: A trucking company that hauls freight. In our context, a small carrier with 1-10 trucks.

**Load**: A shipment that needs to be transported from one location to another. Also called a "haul" or "trip".

**Shipper**: The company or individual sending the freight (the customer).

**Consignee**: The company or individual receiving the freight.

## Load-Related Terms

**BOL (Bill of Lading)**: Legal document between shipper and carrier detailing the freight being transported.

**POD (Proof of Delivery)**: Document signed by consignee confirming delivery was completed.

**Rate Confirmation**: Agreement between carrier and shipper on the rate to be paid for the load.

**Deadhead**: Empty miles driven without freight (e.g., driving to pickup location).

**Load Number**: Unique identifier for a load (e.g., LD-ABC123).

**Status**: Current state of a load (Pending, Assigned, In Transit, Delivered, etc.).

## Driver-Related Terms

**CDL (Commercial Driver's License)**: Required license to operate commercial vehicles.

**HOS (Hours of Service)**: Federal regulations limiting how long a driver can be on duty.

**ELD (Electronic Logging Device)**: Device that automatically records driver HOS data.

**DOT Number**: Department of Transportation identification number for commercial vehicles and drivers.

**Pre-trip Inspection**: Required inspection performed by driver before starting their trip.

**Post-trip Inspection**: Inspection performed by driver after completing their trip.

## Dispatch Terms

**Dispatch**: The act of assigning a load to a driver and coordinating its execution.

**Dispatcher**: Person responsible for assigning loads, tracking progress, and communicating with drivers.

**Queue**: A collection of loads grouped by status or priority (e.g., "Needs Attention").

**Assignment**: Linking a specific driver and vehicle to a load.

## Billing Terms

**Rate**: Amount the shipper pays for the load (usually in cents per mile or flat rate).

**Invoice**: Bill sent to shipper requesting payment for completed load.

**Accessorial Charges**: Additional fees beyond the base rate (e.g., detention, fuel surcharge).

**Detention**: Extra fee charged when driver is kept waiting at pickup/delivery beyond free time.

## Compliance & Safety Terms

**CSA (Compliance, Safety, Accountability)**: FMCSA's safety measurement system.

**DVIR (Driver Vehicle Inspection Report)**: Report documenting vehicle inspection results.

**IFTA (International Fuel Tax Agreement)**: Agreement for reporting fuel usage across jurisdictions.

**MC Number**: Motor Carrier operating authority number from FMCSA.

## Integration Terms

**Samsara**: Telematics platform for vehicle tracking, ELD, and fleet management.

**Motive (formerly KeepTruckin)**: Alternative telematics/ELD platform.

**DAT/Truckstop**: Load boards where carriers find available freight.

**Webhook**: Automated notification sent from one system to another when an event occurs.

## System Terms

**Event**: A recorded action or change in the system (e.g., "Load status changed to In Transit").

**Read Model**: Denormalized view of data optimized for querying (e.g., dispatcher queues).

**Repository**: Code pattern for abstracting database operations.

**Guard**: Function that checks permissions or authentication before allowing an action.
