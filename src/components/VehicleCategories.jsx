import React from 'react';
import { motion } from 'framer-motion';
import CategoryCard from './CategoryCard'; 

export default function VehicleCategories({ onSelect }) {
  const vehicles = [
    { 
      id: 'Lexus', 
      name: 'Lexus', 
      models: 'Luxury Sedan', 
      specialty: 'Executive Travel',
      passengers: 3, 
      luggage: 2,
      hook: 'Sleek, stylish, and perfect for VIP business transfers.',
      img: '/car/lexus.jpeg'
    },
    { 
      id: 'Highlander', 
      name: 'Toyota Highlander', 
      models: 'Premium SUV', 
      specialty: 'Family Comfort',
      passengers: 5, 
      luggage: 5,
      hook: 'Spacious, elevated SUV with a flawlessly smooth ride.',
      img: '/car/highlender.jpeg'
    },
    { 
      id: 'Outlander', 
      name: 'Mitsubishi Outlander', 
      models: 'Versatile SUV', 
      specialty: 'City & Adventure',
      passengers: 5, 
      luggage: 5,
      hook: 'Reliable, comfortable, and perfect for luggage-heavy trips.',
      img: '/car/outlander.jpeg'
    },
    { 
      id: 'Axis', 
      name: 'Axis', 
      models: 'Standard Comfort', 
      specialty: 'Smart City Rides',
      passengers: 3, 
      luggage: 2,
      hook: 'Efficient and highly comfortable daily transport.',
      img: '/car/axis.jpeg'
    },
    { 
      id: 'Carnival', 
      name: 'Kia Carnival', 
      models: 'Premium MPV', 
      specialty: 'Group Travel',
      passengers: 7, 
      luggage: 6,
      hook: 'The ultimate family minivan with premium VIP seating.',
      img: '/car/KiaCarnival.jpeg'
    },
    { 
      id: 'Staria', 
      name: 'Hyundai Staria', 
      models: 'Modern MPV', 
      specialty: 'Futuristic Space',
      passengers: 7, 
      luggage: 6,
      hook: 'Next-gen design with expansive legroom and windows.',
      img: '/car/staria.jpeg'
    },
    { 
      id: 'Citroen', 
      name: 'Citroën', 
      models: 'Business Van', 
      specialty: 'Team Transport',
      passengers: 7, 
      luggage: 6,
      hook: 'Practical, elegant European design for larger groups.',
      img: '/car/Citroen.jpeg'
    },
    { 
      id: 'VClass', 
      name: 'Mercedes V-Class', 
      models: 'Luxury Van', 
      specialty: 'Corporate Elite',
      passengers: 7, 
      luggage: 6,
      hook: 'The absolute gold standard for luxury group travel.',
      img: '/car/v%20class.jpeg'
    }
  ];

  return (
    <section className="py-20 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black italic uppercase text-white mb-4">
            Our <span className="text-amber-500">Premium</span> Fleet
          </h2>
          <p className="text-slate-400 text-sm tracking-widest uppercase font-bold">
            Select a vehicle to begin your booking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {vehicles.map((car, index) => (
            <CategoryCard 
              key={index} 
              item={car} 
              index={index} 
              onSelect={() => onSelect(car.id)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}