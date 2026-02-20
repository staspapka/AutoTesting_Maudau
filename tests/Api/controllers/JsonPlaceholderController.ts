import { APIRequestContext } from '@playwright/test';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    city: string;
  };
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export class JsonPlaceholderController {
  constructor(private request: APIRequestContext) {}

  async getUsers(): Promise<User[]> {
    const response = await this.request.get('https://jsonplaceholder.typicode.com/users');
    return response.json();
  }

  async getPosts(): Promise<Post[]> {
    const response = await this.request.get('https://jsonplaceholder.typicode.com/posts');
    return response.json();
  }
}
