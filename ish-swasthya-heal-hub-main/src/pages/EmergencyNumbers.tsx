import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Hospital {
  name: string;
  city: string;
  phone?: string[];
  website?: string;
  map?: string;
}

const hospitals: Hospital[] = [
  { name: "Padma Hospital", city: "Bhubaneswar", phone: ["9437071386"] },
  { name: "Capital Hospital", city: "Bhubaneswar", phone: ["0674-2391983"], map: "#" },
  { name: "Municipal Hospital", city: "Bhubaneswar", phone: ["0674-2591237"] },
  { name: "Kalinga Hospital", city: "Bhubaneswar", phone: ["0674-6665200", "18005724000"], map: "#", website: "#" },
  { name: "Sum Hospital", city: "Bhubaneswar", phone: ["0674-2386281"] },
  { name: "Apex Hospital", city: "Bhubaneswar", phone: ["9437141007"] },
  { name: "Ayurvedic Hospital", city: "Bhubaneswar", phone: ["0674-2432347"] },
  { name: "Aditya Care Hospitals", city: "Bhubaneswar" },
  { name: "L.V. Prasad Eye Institute", city: "Bhubaneswar" },
  { name: "Ashwini Hospital", city: "Cuttack" },
  { name: "Ayush Hospital", city: "Bhubaneswar" },
  { name: "Apollo Hospital", city: "Bhubaneswar" },
  { name: "Kanungo Institute of Diabetic Specialities", city: "Bhubaneswar" },
  { name: "Kalinga Institute of Medical Sciences", city: "Bhubaneswar" },
  { name: "Hi-Tech Medical College & Hospital", city: "Bhubaneswar" },
  { name: "IMS & SUM Hospital", city: "Bhubaneswar" },
  { name: "M/s Shanti Memorial Hospital", city: "Cuttack" },
  { name: "Chitta Ranjan Seva Sadan", city: "Niali, Cuttack" },
  { name: "Christian Hospital", city: "Bisamkatak, Rayagada" },
  { name: "Christian Hospital", city: "Nawarangapur" },
  { name: "Seven Hills Hospital", city: "Visakhapatnam" },
  { name: "CARE Hospital", city: "Visakhapatnam" },
  { name: "Apollo Hospital", city: "Visakhapatnam" },
  { name: "Escort Heart Institute", city: "Raipur, Chhattisgarh" },
  { name: "Narayan Hrudayalaya (MMI)", city: "Raipur, Chhattisgarh" },
  { name: "Ramakrishna Hospital", city: "Raipur, Chhattisgarh" },
];

const EmergencyNumbers = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Emergency Hospital Contacts</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((hospital, idx) => (
          <Card key={idx} className="p-4 shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{hospital.name}</h2>
            <p className="text-gray-600 mb-2">{hospital.city}</p>
            {hospital.phone?.map((num, i) => (
              <Button
                key={i}
                size="sm"
                className="mb-1 w-full"
                onClick={() => window.open(`tel:${num}`, "_self")}
              >
                Call: {num}
              </Button>
            ))}
            {hospital.map && (
              <Button
                size="sm"
                className="w-full mt-1"
                onClick={() => window.open(hospital.map, "_blank")}
              >
                View Map
              </Button>
            )}
            {hospital.website && (
              <Button
                size="sm"
                className="w-full mt-1"
                onClick={() => window.open(hospital.website, "_blank")}
              >
                Visit Website
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmergencyNumbers;
