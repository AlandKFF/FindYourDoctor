const express = require('express');
const router = express.Router();
const { Hospital, Doctor, HospitalPhone, HospitalFacility, Area, City, Country, DoctorCertification } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { summary: { [Op.like]: `%${search}%` } },
                    { address: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const hospitals = await Hospital.findAll({
            where: whereClause,
            include: [
                {
                    model: Area,
                    include: [
                        {
                            model: City,
                            include: [Country]
                        }
                    ]
                },
                {
                    model: HospitalPhone
                },
                {
                    model: HospitalFacility
                },
                {
                    model: Doctor,
                    through: { attributes: [] }
                }
            ]
        });
        console.log(hospitals);
        res.render('hospitals/index', { hospitals, search, title: 'Hospitals' });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospitals' });
    }
});

router.get('/create', async (req, res) => {
    try {
        const areas = await Area.findAll({
            include: [{
                model: City,
                include: [Country]
            }]
        });
        res.render('hospitals/create', { areas, title: 'Create Hospital' });
    } catch (error) {
        console.error('Error loading create hospital form:', error);
        res.status(500).render('error', { message: 'Failed to load create form' });
    }
});

router.post('/create', async (req, res) => {
    try {
        const {
            name,
            area_id,
            summary,
            emergency_status,
            address,
            contact_email,
            website,
            is_private,
            phone_numbers,
            facilities
        } = req.body;

        const hospital = await Hospital.create({
            name,
            area_id,
            summary,
            emergency_status: emergency_status === 'true',
            address,
            contact_email,
            website,
            is_private: is_private === 'true'
        });

        if (phone_numbers && Array.isArray(phone_numbers)) {
            await Promise.all(phone_numbers.map(phone =>
                HospitalPhone.create({
                    hospital_id: hospital.hospital_id,
                    phone_number: phone
                })
            ));
        }

        if (facilities && Array.isArray(facilities)) {
            await Promise.all(facilities.map(facility =>
                HospitalFacility.create({
                    hospital_id: hospital.hospital_id,
                    facility_name: facility
                })
            ));
        }

        res.redirect(`/hospitals/${hospital.hospital_id}`);
    } catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).render('error', { message: 'Failed to create hospital' });
    }
});

router.get('/:id/edit', async (req, res) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id, {
            include: [
                {
                    model: Area,
                    include: [{
                        model: City,
                        include: [Country]
                    }]
                },
                HospitalPhone,
                HospitalFacility
            ]
        });

        if (!hospital) {
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        const areas = await Area.findAll({
            include: [{
                model: City,
                include: [Country]
            }]
        });

        res.render('hospitals/edit', { hospital, areas, title: `Edit ${hospital.name}` });
    } catch (error) {
        console.error('Error loading edit hospital form:', error);
        res.status(500).render('error', { message: 'Failed to load edit form' });
    }
});

router.post('/:id/edit', async (req, res) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id);
        if (!hospital) {
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        const {
            name,
            area_id,
            summary,
            emergency_status,
            address,
            contact_email,
            website,
            is_private,
            phone_numbers,
            facilities
        } = req.body;

        await hospital.update({
            name,
            area_id,
            summary,
            emergency_status: emergency_status === 'true',
            address,
            contact_email,
            website,
            is_private: is_private === 'true'
        });

        if (phone_numbers && Array.isArray(phone_numbers)) {
            await HospitalPhone.destroy({
                where: { hospital_id: hospital.hospital_id }
            });
            await Promise.all(phone_numbers.map(phone =>
                HospitalPhone.create({
                    hospital_id: hospital.hospital_id,
                    phone_number: phone
                })
            ));
        }

        if (facilities && Array.isArray(facilities)) {
            await HospitalFacility.destroy({
                where: { hospital_id: hospital.hospital_id }
            });
            await Promise.all(facilities.map(facility =>
                HospitalFacility.create({
                    hospital_id: hospital.hospital_id,
                    facility_name: facility
                })
            ));
        }

        res.redirect(`/hospitals/${hospital.hospital_id}`);
    } catch (error) {
        console.error('Error updating hospital:', error);
        res.status(500).render('error', { message: 'Failed to update hospital' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching hospital with ID:', req.params.id);

        const hospital = await Hospital.findByPk(req.params.id, {
            include: [
                {
                    model: Area,
                    include: [
                        {
                            model: City,
                            include: [Country]
                        }
                    ]
                },
                {
                    model: HospitalPhone
                },
                {
                    model: HospitalFacility
                },
                {
                    model: Doctor,
                    include: [DoctorCertification],
                    through: { attributes: [] }
                }
            ]
        });

        console.log('Hospital fetched:', hospital);

        if (!hospital) {
            console.log('Hospital not found');
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        console.log('Rendering hospital profile');
        res.render('hospitals/profile', { hospital, title: hospital.name });
    } catch (error) {
        console.error('Error fetching hospital profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospital profile' });
    }
});

module.exports = router;