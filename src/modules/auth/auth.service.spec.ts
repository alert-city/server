import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService}   from '@/modules/auth/token.service';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { RefreshTokenResponse } from '@/modules/auth/token.service';

describe('AuthService',()=>{
  let service:AuthService;
  let userService:UserService;
  let jwtService:JwtService;
  let tokenService:TokenService;

  beforeEach(async()=>{
  const module:TestingModule = await Test.createTestingModule({
  providers:[
    AuthService,
    {
      provide:UserService,
      useValue:{
        findUserByUsername:jest.fn(),
        updateUser:jest.fn()
      }
    },
    {
      provide:JwtService,
      useValue:{
        sign:jest.fn()
      }
    },
    TokenService
  ]
  }).compile()

  service = module.get<AuthService>(AuthService);
  userService = module.get<UserService>(UserService);
  jwtService = module.get<JwtService>(JwtService);
  tokenService = module.get<TokenService>(TokenService);
  })

  it('should be defined', async () => {
    expect(service).toBeDefined()
  });

  describe('login',()=>{
    it('should login succeed and return a specific object', async () => {
      const mockUser: UserResponseDto = {
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: await bcrypt.hash('zzzz', 10),  // 假设密码已经被哈希
        role: 'normal',
        mobilePhone: '+61412345678',
        refreshToken: null,
      };
      const mockResponse:LoginResponseDto = {
      message:'login successful',
      accessToken:'accessToken',
      role:'normal',
      name: { firstName: 'John', lastName: 'Doe' },
      }
      const input:LoginRequestDto ={
      username:'jinyuanzhang1992@hotmail.com',
      password:'zzzz',
      stay_signed_in:true
      }
      const contextMock = {
        res: {
          cookie: jest.fn(),
        },
      };
      jest.spyOn(userService, 'findUserByUsername').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
      jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUser);
      // 依赖项的模拟
      expect(await service.login(input,contextMock)).toEqual(mockResponse);
      expect(contextMock.res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String), // 检查 refreshToken 的值
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: expect.any(Number),
        }
      );
      // 检查是否调用了 res.cookie 方法来设置 refreshToken
    });
  })

  describe('logout',()=>{
    it('should return if logout succeed', async () => {
      const mockUser: UserResponseDto = {
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: await bcrypt.hash('zzzz', 10),  // 假设密码已经被哈希
        role: 'normal',
        mobilePhone: '+61412345678',
        refreshToken: null,
      };
      const contextMock = {
      res: {
        clearCookie: jest.fn(),
      },
      }
      const result = true;
      const id = '123';
      jest.spyOn(tokenService, 'processToken').mockResolvedValue({ id } as RefreshTokenResponse);
      jest.spyOn(userService,'updateUser').mockResolvedValue(mockUser);
      expect(await service.logout(contextMock)).toBe(result);
      expect(contextMock.res.clearCookie).toHaveBeenCalledWith('refreshToken',{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    });

  })

})
