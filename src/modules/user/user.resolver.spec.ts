import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserResponseDto } from '@/common/dtos/user-response.dto';
import { UserRequestDto } from '@/common/dtos/user-request.dto';
import { CombinedAuthGuard } from '@/common/guards/combined-auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import { TokenService } from '@/modules/auth/token.service';
import { AccessTokenGuard } from '@/common/guards/jwt-access-auth.guard';
import { RefreshJwtAuthGuard } from '@/common/guards/jwt-refresh-auth.guard';
import { NotFoundException } from '@nestjs/common';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;
  //声明两个变量resolver和userService，用于在后续的测试中使用

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: {
            findAllUsers: jest.fn(),
            findOneUser: jest.fn(),
            // findUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: CombinedAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('newAccessToken'),
          },
        },
        {
          provide: TokenService,
          useValue: {
            processToken: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AccessTokenGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: RefreshJwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        }
      ],
    }).compile();
    //beforeEach方法是在每个测试用例之前运行的方法，这里是创建一个测试模块，然后编译它
    //const module: TestingModule = await Test.createTestingModule方法是创建一个测试模块，然后返回一个TestingModule实例
    //.compile()方法是编译这个测试模块

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
    //module.get 方法是从测试module中获取实例，并将将其赋值给resolver和userService以便在后续的测试中使用
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
  //it方法是一个测试用例，这里是测试resolver是否被定义，因为resolver方法在后面的测试中会被使用，所以需要测试它是否被定义
  
  describe('findAllUsers',()=>{
    it('should return an array of user', async () => {
      const result:UserResponseDto[] =[
        {
        id: '123',
        name: {firstName: 'John', lastName: 'Doe'},
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone:"+61412345678",
        refreshToken: null,
        }
      ];
      jest.spyOn(userService, 'findAllUsers').mockResolvedValue(result);
      expect(await resolver.findAllUsers()).toBe(result);
    });
  });

  describe('findOneUser', ()=>{
  it('should return a user', async ()=> {
  const result: UserResponseDto = {
    id: '123',
    name: { firstName: 'John', lastName: 'Doe' },
    username: 'jinyuanzhang1992@hotmail.com',
    password: 'zzzz',
    role: 'normal',
    mobilePhone: "+61412345678",
    refreshToken: null,
  }
  //定义一个result变量，相当于数据库中的一个用户数据
  jest.spyOn(userService, 'findOneUser').mockResolvedValue(result);
  //使用jest.spyOn方法模拟userService中的findOneUser方法，并模拟返回result，这样就不会真正调用findOneUser方法
  expect(await resolver.findOneUser('123')).toBe(result);
  })
  })

  describe('createUser',()=>{
    it('should create and return a user', async () => {
      const input: UserRequestDto = {
      name: { firstName: 'John', lastName: 'Doe' },
      username: 'jinyuanzhang1992@hotmail.com',
      password: 'zzzz',
      role: 'normal',
      mobilePhone: "+61412345678",
      }
      //定义一个input变量，相当于前端传入的用户数据

      const result: UserResponseDto = {
      id: '123',
      name: { firstName: 'John', lastName: 'Doe' },
      username: 'jinyuanzhang1992@hotmail.com',
      password: 'zzzz',
      role: 'normal',
      mobilePhone: "+61412345678",
      refreshToken: null,
      }
      //定义一个result变量，相当于数据库中的一个用户数据

      jest.spyOn(userService, 'createUser').mockResolvedValue(result);
      //使用jest.spyOn方法模拟userService中的createUser方法，并模拟返回result，这样就不会真正调用createUser方法
      expect(await resolver.createUser(input)).toBe(result);
    });
  })

  describe('updateUser',()=>{
    it('should update and return a user', async () => {
    const id = '123';
    const input: UserRequestDto = {
      name: { firstName: 'John', lastName: 'Doe' },
      username: 'jinyuanzhang1992@hotmail.com',
      password: 'zzzz',
      role: 'normal',
      mobilePhone: "+61412345678",
    }
    const result: UserResponseDto = {
    id: '123',
    name: { firstName: 'John', lastName: 'Doe' },
    username: 'jinyuanzhang1992@hotmail.com',
    password: 'zzzz',
    role: 'normal',
    mobilePhone: "+61412345678",
    refreshToken: null,
    }
    jest.spyOn(userService, 'updateUser').mockResolvedValue(result);
    expect(await resolver.updateUser(id, input)).toBe(result);
    });
  })

  describe('deleteUser',()=>{
    it('should delete a user', async () => {
    const id = '123';
    const result = true;
    jest.spyOn(userService, 'deleteUser').mockResolvedValue(result);
    expect(await resolver.deleteUser(id)).toBe(result);
    });
    it('should throw NotFoundException if user is not found', async () => {
      const id = '123';
      jest.spyOn(userService, 'deleteUser').mockImplementation(() => {
        throw new NotFoundException('User not found');
      }); // 模拟抛出异常
      await expect(resolver.deleteUser(id)).rejects.toThrow(NotFoundException);
    });
  })

});