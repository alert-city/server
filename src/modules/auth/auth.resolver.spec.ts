import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LoginResponseDto } from '@/common/dtos/login-response.dto';
import { LoginRequestDto } from '@/common/dtos/login-request.dto';

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
            logout: jest.fn(),
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

  describe('login',()=>{
    it('should login succeed', async () => {
      const input: LoginRequestDto = {
      username: 'jinyuanzhang1992@hotmail.com',
      password: 'zzzz',
      stay_signed_in: true,
      }
      const context = {
        res: {
          cookie: jest.fn(),
        },
      };
      const result:LoginResponseDto ={
        message: 'login successful',
        accessToken: 'accessToken',
        role: 'normal',
        name: { firstName: 'John', lastName: 'Doe' },
      }
      jest.spyOn(authService,'login').mockResolvedValue(result);
      expect(await resolver.login(input,context)).toBe(result);
    });
  })

  describe('logout',()=>{
    it('should return if logout succeed', async () => {
      const context = {
        res: {
          cookie: jest.fn(),
        },
      };
      const result:boolean = true;
      jest.spyOn(authService,'logout').mockResolvedValue(result);
      expect(await resolver.logout(context)).toBe(result);
    });
  })
});
