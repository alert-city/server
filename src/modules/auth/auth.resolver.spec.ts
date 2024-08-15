import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            revokeTokens: jest.fn(),
          },
        },
      ],
    }).compile();
    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should login succeed', async () => {
      const input: LoginRequestDto = {
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        isStaySignedIn: true,
      };
      const result: LoginResponseDto = {
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        role: ['normal'],
        mobilePhone: '+61412345678',
        accessToken: 'accessToken',
        organization: ['123'],
        accountType: 'normal',
      };
      jest.spyOn(authService, 'login').mockResolvedValue(result);
      expect(await resolver.login(input)).toBe(result);
    });
  });

  describe('logout', () => {
    it('should return if logout succeed', async () => {
      const context = {
        res: {
          cookie: jest.fn(),
        },
      };
      const result: boolean = true;
      jest.spyOn(authService, 'revokeTokens').mockResolvedValue(result);
      expect(await resolver.revokeTokens(context)).toBe(result);
    });
  });
});
