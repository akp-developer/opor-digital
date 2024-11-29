import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app';
import { Event } from '../../models/calendar.model';
import { EventCheckin } from '../../models/event-checkin.model';
import { createToken } from '../../core/utils/auth';

describe('Calendar Module', () => {
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let testEventId: string;

  beforeAll(async () => {
    // Setup in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test auth token
    authToken = createToken({ 
      userId: 'test-user',
      tenantId: 'test-tenant',
      role: 'admin'
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Event.deleteMany({});
    await EventCheckin.deleteMany({});
  });

  describe('Event CRUD Operations', () => {
    const testEvent = {
      title: 'Test Event',
      description: 'Test Description',
      startDate: new Date('2024-12-01T09:00:00Z'),
      endDate: new Date('2024-12-01T12:00:00Z'),
      location: 'Test Location',
      isRecurring: false,
      maxParticipants: 50
    };

    test('Should create new event', async () => {
      const response = await request(app)
        .post('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testEvent)
        .expect(201);

      testEventId = response.body.data._id;
      expect(response.body.data.title).toBe(testEvent.title);
    });

    test('Should get event list', async () => {
      await request(app)
        .get('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body.data)).toBeTruthy();
        });
    });

    test('Should get single event', async () => {
      const createResponse = await request(app)
        .post('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testEvent);

      await request(app)
        .get(`/api/calendar/${createResponse.body.data._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(response.body.data.title).toBe(testEvent.title);
        });
    });
  });

  describe('Event Check-in System', () => {
    let eventId: string;

    beforeEach(async () => {
      // Create test event
      const event = new Event({
        title: 'Check-in Test Event',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000),
        location: 'Test Location'
      });
      const savedEvent = await event.save();
      eventId = savedEvent._id.toString();
    });

    test('Should generate QR code for event', async () => {
      await request(app)
        .get(`/api/calendar/${eventId}/qr`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(response.body.data.qrCode).toBeDefined();
        });
    });

    test('Should check-in user with QR code', async () => {
      await request(app)
        .post(`/api/calendar/${eventId}/qr-checkin`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: 'test-qr-code',
          location: {
            latitude: 13.7563,
            longitude: 100.5018
          }
        })
        .expect(200);
    });
  });

  describe('Event Reports', () => {
    test('Should get attendance report', async () => {
      const event = await Event.create({
        title: 'Report Test Event',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000)
      });

      await request(app)
        .get(`/api/calendar/${event._id}/attendance`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
        });
    });

    test('Should download Excel report', async () => {
      const event = await Event.create({
        title: 'Excel Report Test Event',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000)
      });

      await request(app)
        .get(`/api/calendar/${event._id}/report`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(response => {
          expect(response.headers['content-type'])
            .toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        });
    });
  });
});