import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

interface UserSession {
  username: string;
  loginAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly SESSION_KEY = 'veterinaria_session';
  private readonly defaultUser = { username: 'admin', password: 'vet2026' };

  constructor(private readonly storage: LocalStorageService) {}

  get currentUser(): UserSession | null {
    return this.storage.read<UserSession | null>(AuthService.SESSION_KEY, null);
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  login(username: string, password: string): boolean {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (
      normalizedUsername !== this.defaultUser.username ||
      normalizedPassword !== this.defaultUser.password
    ) {
      return false;
    }

    this.storage.write<UserSession>(AuthService.SESSION_KEY, {
      username: this.defaultUser.username,
      loginAt: new Date().toISOString(),
    });
    return true;
  }

  logout(): void {
    this.storage.remove(AuthService.SESSION_KEY);
  }
}
