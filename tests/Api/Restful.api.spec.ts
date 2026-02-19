import { test, expect } from '../../fixtures/base';

test.describe.serial('Full API Request Lifecycle', () => {
  let objectId: string;

  test('POST - Create new device', async ({ deviceController, data }) => {
    const payload = data.api.iphone14;
    const response = await deviceController.createDevice(payload);

    expect(response.status()).toBe(200);

    const body = await response.json();
    objectId = body.id;

    expect(body.id).toBeDefined();
    expect(body.name).toBe(payload.name);
  });

  test('GET - Validate device creation', async ({ deviceController, data }) => {
    const response = await deviceController.getDeviceById(objectId);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(objectId);
    expect(body.name).toBe(data.api.iphone14.name);
  });

  test('PUT - Full update of the device object', async ({ deviceController, data }) => {
    const payload = data.api.iphone14Updated;
    const response = await deviceController.updateDevice(objectId, payload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(payload.name);
    expect(body.data['Hard disk size']).toBe(payload.data['Hard disk size']);
  });

  test('PATCH - Partial update (change device name only)', async ({ deviceController, data }) => {
    const payload = data.api.iphonePatch;
    const response = await deviceController.patchDevice(objectId, payload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(payload.name);
  });

  test('DELETE - Remove the device from the system', async ({ deviceController }) => {
    const response = await deviceController.deleteDevice(objectId);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toContain(objectId);
  });

  test('GET - Final 404 validation after deletion', async ({ deviceController }) => {
    const response = await deviceController.getDeviceById(objectId);
    expect(response.status()).toBe(404);
  });
});
