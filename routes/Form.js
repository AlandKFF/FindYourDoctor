const express = require('express');
const router = express.Router();
const { Doctor, Hospital, Country, City, Village, HospitalPhone, Facility, HospitalGallery, DoctorHospital } = require('../models');

// GET routes
router.get('/doctor', async (req, res) => {
    try {
        const hospitals = await Hospital.findAll({
            attributes: ['hospital_id', 'name']
        });
        hospitals.forEach(hospital => {
            console.log(`Hospital ID: ${hospital.dataValues.hospital_id}, Name: ${hospital.dataValues.name}`);
        });
        res.render('forms/doctor', { hospitals, title:"Add Doctor" });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.render('forms/doctor', { 
            hospitals: [],
            error: 'Failed to fetch hospitals',
            title: 'Add Dcotor'
        });
    }
});

router.get('/hospital', async (req, res) => {
    try {
        const countries = await Country.findAll({
            attributes: ['country_id', 'name'],
            include: {
                model: City,
                attributes: ['city_id', 'name'],
                include: {
                    model: Village,
                    attributes: ['village_id', 'name']
                }
            }
        });
        countries.forEach(country => {
            console.log(`Country: ${country.name}`);
            country.Cities.forEach(city => {
            console.log(`  City: ${city.name}`);
            city.Villages.forEach(village => {
                console.log(`    Village: ${village.name}`);
            });
            });
        });
        res.render('forms/hospital', { countries, title:'Add Hospital' });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.render('forms/hospital', { 
            countries: [],
            error: 'Failed to fetch locations',
            title: 'Add Hospital'
        });
    }
});

// POST routes
router.post('/doctor', async (req, res) => {
    console.log(req.body,'\n========================');
    
    try {
        const { 
            first_name, 
            last_name, 
            title, 
            bio, 
            year_starting_work, 
            image_url,
            hospitals,
            certification_name,
            awarding_institution,
            awarded_date,
            available_from,
            available_until,
        } = req.body;

        // Create doctor
        const doctor = await Doctor.create({
            first_name,
            last_name,
            title,
            bio,
            year_starting_work,
            image_url
        });

        // Add certification if provided
        if (certification_name && awarding_institution) {
            await doctor.createDoctor_Certification({
                certification_name,
                awarding_institution,
                awarded_date: awarded_date || new Date()
            });
        }

        console.log(hospitals);
        const hospitalArray = Array.isArray(hospitals) ? hospitals : hospitals.split(',').map(h => h.trim());
            for (const hospitalId of hospitalArray) {
            for (const hospitalId of hospitals) {
            try {
                await DoctorHospital.create({
                doctor_id: doctor.doctor_id,
                hospital_id: hospitalId,
                available_from,
                available_until
                });
                console.log(`Successfully associated doctor ID ${doctor.doctor_id} with hospital ID ${hospitalId}`);
            } catch (error) {
                console.error(`Error associating doctor ID ${doctor.doctor_id} with hospital ID ${hospitalId}:`, error);
            }
            }
        }

        res.redirect('/doctor');
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).send('Error creating doctor');
    }
});

router.post('/hospital', async (req, res) => {
    try {
        const {
            name,
            summary,
            emergency_status,
            address,
            contact_email,
            website,
            parking_availability,
            open_at,
            close_at,
            country_name,
            city_name,
            village_name,
            phone_numbers,
            facilities,
            gallery_urls
        } = req.body;
        
        // Create location hierarchy
        const country = await Country.create({ name: country_name });
        const city = await City.create({ 
            name: city_name,
            country_id: country.country_id 
        });
        const village = await Village.create({
            name: village_name,
            city_id: city.city_id
        });

        // Create hospital
        const hospital = await Hospital.create({
            name,
            summary,
            emergency_status: emergency_status === 'on',
            address,
            contact_email,
            website,
            parking_availability: parking_availability === 'on',
            open_at,
            close_at,
            village_id: village.village_id
        });

        // Add phone numbers
        if (phone_numbers && phone_numbers.length > 0) {
            const phoneArray = phone_numbers.split(',').map(phone => phone.trim());
            for (const phoneNumber of phoneArray) {
                await HospitalPhone.create({
                    hospital_id: hospital.hospital_id,
                    phone_number: phoneNumber
                });
            }
        }

        // Add facilities
        if (facilities && facilities.length > 0) {
            const facilityArray = facilities.split(',').map(facility => facility.trim());
            for (const facilityName of facilityArray) {
                const [facility] = await Facility.findOrCreate({
                    where: { name: facilityName }
                });
                await hospital.addFacility(facility);
            }
        }

        // Add gallery images
        if (gallery_urls && gallery_urls.length > 0) {
            const urlArray = gallery_urls.split(',').map(url => url.trim());
            for (const imageUrl of urlArray) {
                await HospitalGallery.create({
                    hospital_id: hospital.hospital_id,
                    image_url: imageUrl
                });
            }
        }

        res.redirect('/hospital');
    } catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).send('Error creating hospital');
    }
});

module.exports = router;