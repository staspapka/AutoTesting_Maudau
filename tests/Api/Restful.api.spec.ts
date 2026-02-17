import { test, expect } from '@playwright/test';
import { DeviceController } from './controllers/DeviceController';
import { devicePayloads } from '../../testData/api/deviceData';

test.describe.serial('Full API Request Lifecycle', () => {
  let deviceController: DeviceController;
  let objectId: string;

  test.beforeEach(async ({ request }) => {
    deviceController = new DeviceController(request);
  });

  test('POST - Create new device', async () => {
    const response = await deviceController.createDevice(devicePayloads.iphone14);
    expect(response.status()).toBe(200);

    const body = await response.json();
    objectId = body.id;

    expect(body.id).toBeDefined();
    expect(body.name).toBe(devicePayloads.iphone14.name);
  });

  test('GET - Validate device creation', async () => {
    const response = await deviceController.getDeviceById(objectId);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(objectId);
    expect(body.name).toBe(devicePayloads.iphone14.name);
  });

  test('PUT - Full update of the device object', async () => {
    const response = await deviceController.updateDevice(objectId, devicePayloads.iphone14Updated);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(devicePayloads.iphone14Updated.name);
    expect(body.data['Hard disk size']).toBe(devicePayloads.iphone14Updated.data['Hard disk size']);
  });

  test('PATCH - Partial update (change device name only)', async () => {
    const response = await deviceController.patchDevice(objectId, devicePayloads.iphonePatch);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(devicePayloads.iphonePatch.name);
  });

  test('DELETE - Remove the device from the system', async () => {
    const response = await deviceController.deleteDevice(objectId);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toContain(objectId);
  });

  test('GET - Final 404 validation after deletion', async () => {
    const response = await deviceController.getDeviceById(objectId);
    expect(response.status()).toBe(404);
  });
});
