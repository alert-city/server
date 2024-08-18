import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@/modules/auth/token.service';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenResponse } from '@/modules/auth/token.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findUserByUsername: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        TokenService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login succeed and return a specific object', async () => {
      const hashedPassword = await bcrypt.hash('zzzz', 10);
      const mockUser: UserResponseDto = {
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: hashedPassword,
        role: ['normal'],
        mobilePhone: '+61412345678',
        refreshToken: null,
        accessToken: 'accessToken',
        organization: ['123'],
        accountType: 'normal',
        displayName: 'John Doe',
        avatarUrl: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        staffs: [],
      };
      const mockResponse: LoginResponseDto = {
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        role: ['normal'],
        accessToken: 'accessToken',
        organization: ['123'],
        accountType: 'normal',
      };
      const input: LoginRequestDto = {
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        isStaySignedIn: true,
      };
      jest.spyOn(userService, 'findUserByUsername').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
      jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUser);
      // 依赖项的模拟
      expect(await service.login(input)).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should return if logout succeed', async () => {
      const mockUser: UserResponseDto = {
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: await bcrypt.hash('zzzz', 10),  // 假设密码已经被哈希
        role: ['normal'],
        mobilePhone: '+61412345678',
        refreshToken: null,
        accessToken: 'accessToken',
        organization: ['123'],
        accountType: 'normal',
        displayName: 'John Doe',
        avatarUrl: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        staffs: [],
      };
      const contextMock = {
        res: {
          clearCookie: jest.fn(),
        },
      };
      const result = true;
      const id = '123';
      jest.spyOn(tokenService, 'processToken').mockResolvedValue({ id } as RefreshTokenResponse);
      jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUser);
      expect(await service.revokeTokens(contextMock)).toBe(result);
    });

  });

});
