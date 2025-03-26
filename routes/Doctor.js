const express = require('express');
const router = express.Router();
const { Doctor, DoctorCertification, Hospital, Area, City, Country } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { title: { [Op.like]: `%${search}%` } },
                    { bio: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const doctors = await Doctor.findAll({
            where: whereClause,
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution']
                },
                {
                    model: Hospital,
                    include: [{
                        model: Area,
                        include: [{
                            model: City,
                            include: [Country]
                        }]
                    }],
                    through: { attributes: [] }
                }
            ]
        });
        res.render('doctors/index', { doctors, search, title: 'Doctors' });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).render('error', { message: 'Failed to fetch doctors' });
    }
});

router.get('/create', async (req, res) => {
    try {
        const hospitals = await Hospital.findAll({
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }]
        });
        res.render('doctors/create', { hospitals, title: 'Create Doctor' });
    } catch (error) {
        console.error('Error loading create doctor form:', error);
        res.status(500).render('error', { message: 'Failed to load create form' });
    }
});

router.post('/create', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            title,
            bio,
            image_url,
            certifications,
            hospitals
        } = req.body;

        const doctor = await Doctor.create({
            first_name,
            last_name,
            title,
            bio,
            image_url
        });

        if (certifications && Array.isArray(certifications)) {
            await Promise.all(certifications.map(cert => 
                DoctorCertification.create({
                    ...cert,
                    doctor_id: doctor.doctor_id
                })
            ));
        }

        if (hospitals && Array.isArray(hospitals)) {
            await doctor.setHospitals(hospitals);
        }

        res.redirect(`/doctors/${doctor.doctor_id}`);
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).render('error', { message: 'Failed to create doctor' });
    }
});

router.get('/:id/edit', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                DoctorCertification,
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });

        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }

        const hospitals = await Hospital.findAll({
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }]
        });

        res.render('doctors/edit', { doctor, hospitals, title: 'Edit Doctor' });
    } catch (error) {
        console.error('Error loading edit doctor form:', error);
        res.status(500).render('error', { message: 'Failed to load edit form' });
    }
});

router.post('/:id/edit', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id);
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }

        const {
            first_name,
            last_name,
            title,
            bio,
            image_url,
            certifications,
            hospitals
        } = req.body;

        await doctor.update({
            first_name,
            last_name,
            title,
            bio,
            image_url
        });

        if (certifications && Array.isArray(certifications)) {
            await DoctorCertification.destroy({
                where: { doctor_id: doctor.doctor_id }
            });
            await Promise.all(certifications.map(cert =>
                DoctorCertification.create({
                    ...cert,
                    doctor_id: doctor.doctor_id
                })
            ));
        }

        if (hospitals && Array.isArray(hospitals)) {
            await doctor.setHospitals(hospitals);
        }

        res.redirect(`/doctors/${doctor.doctor_id}`);
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).render('error', { message: 'Failed to update doctor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution', 'awarded_date']
                },
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }
        
        res.render('doctors/profile', { doctor, title: 'Doctor Profile' });
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch doctor profile' });
    }
});

module.exports = router;