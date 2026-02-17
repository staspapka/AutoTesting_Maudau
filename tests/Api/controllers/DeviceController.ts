import { APIRequestContext } from '@playwright/test';

export class DeviceController {
  private request: APIRequestContext;
  private readonly endpoint = 'https://api.restful-api.dev/objects';

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createDevice(payload: object) {
    return await this.request.post(this.endpoint, { data: payload });
  }

  async getDeviceById(id: string) {
    return await this.request.get(`${this.endpoint}/${id}`);
  }

  async updateDevice(id: string, payload: object) {
    return await this.request.put(`${this.endpoint}/${id}`, { data: payload });
  }

  async deleteDevice(id: string) {
    return await this.request.delete(`${this.endpoint}/${id}`);
  }

  async patchDevice(id: string, payload: object) {
    return await this.request.patch(`${this.endpoint}/${id}`, { data: payload });
  }
}
