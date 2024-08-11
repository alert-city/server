import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { NotFoundException } from '@nestjs/common';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<UserResponseDto>;
  //需要声明userModel变量，用于模拟User模型

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();
    //getModelToken用于注入模型，这里注入了User模型
    //useValue:用于模拟User模型的方法

    userService = module.get<UserService>(UserService);
    userModel= module.get<Model<UserResponseDto>>(getModelToken('User'));
  });

  it('should be defined', async () => {
    expect(userService).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers: UserResponseDto[] = [
        {
          id: '123',
          name: { firstName: 'John', lastName: 'Doe' },
          username: 'jinyuanzhang1992@hotmail.com',
          password: 'zzzz',
          role: 'normal',
          mobilePhone: '+61412345678',
          refreshToken: null,
        },
      ];
      jest.spyOn(userModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      } as any);
      expect(await userService.findAllUsers()).toBe(mockUsers);
    });

    it('should throw NotFoundException if no users are found', async () => {
      jest.spyOn(userModel,'find').mockReturnValue({
      exec:jest.fn().mockResolvedValue([]),
      } as any);
      await expect(userService.findAllUsers()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneUser',()=>{
    it('should return one user', async () => {
      const id = '123';
      const mockUser:UserResponseDto ={
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
        refreshToken: null,
      }
      jest.spyOn(userModel,'findById').mockReturnValue({
      exec:jest.fn().mockResolvedValue(mockUser),
      } as any);
      expect(await userService.findOneUser(id)).toBe(mockUser);
    });
    it('should return NotFoundException if no user found', async () => {
      const id = '123';
      jest.spyOn(userModel,'findById').mockReturnValue({
      exec:jest.fn().mockResolvedValue(null)
      } as any);
      await expect(userService.findOneUser(id)).rejects.toThrow(NotFoundException)
    });
  })

  describe('updateUser',()=>{
    it('should update and return a user', async () => {
      const id  = '123';
      const input:UserRequestDto ={
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
      }
      const mockUser:UserResponseDto ={
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
        refreshToken: null,
      }
      jest.spyOn(userModel,'findByIdAndUpdate').mockReturnValue({
      exec:jest.fn().mockResolvedValue(mockUser),
      } as any);
      expect(await userService.updateUser(id,input)).toBe(mockUser);
    });

    it('should return NotFoundException if no user found', async () => {
      const id  = '123';
      const input:UserRequestDto ={
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
      }
      jest.spyOn(userModel,'findByIdAndUpdate').mockReturnValue({
      exec:jest.fn().mockResolvedValue(null),
      } as any);
      await expect(userService.updateUser(id,input)).rejects.toThrow(NotFoundException);
    });
  })

  describe('createUser',()=>{
    it('should create and return a new user', async () => {
      const input:UserRequestDto ={
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
      }
      const mockUser:UserResponseDto ={
        id: '123',
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
        refreshToken: null,
      }
      jest.spyOn(userModel,'create').mockReturnValue(mockUser as any);
      expect(await userService.createUser(input)).toBe(mockUser);
    });
    it('should return NotFoundException if create failed', async () => {
      const input:UserRequestDto ={
        name: { firstName: 'John', lastName: 'Doe' },
        username: 'jinyuanzhang1992@hotmail.com',
        password: 'zzzz',
        role: 'normal',
        mobilePhone: '+61412345678',
      }
      jest.spyOn(userModel,'create').mockReturnValue(null as any);
      await expect(userService.createUser(input)).rejects.toThrow(NotFoundException);
    });
    
    describe('deleteUser',()=>{
      it('should return if delete succeed', async () => {
        const id = '123';
        const result = true;
        jest.spyOn(userModel,'findByIdAndDelete').mockReturnValue({
        exec:jest.fn().mockResolvedValue(true)
        } as any);
        expect(await userService.deleteUser(id)).toBe( result);
      });
      it('should return NotFoundException if delete failed', async() => {
        const id = '123';
        jest.spyOn(userModel,'findByIdAndDelete').mockReturnValue({
        exec:jest.fn().mockResolvedValue(null)
        } as any);
        await expect(userService.deleteUser(id)).rejects.toThrow(NotFoundException);
      });

    })

  })


});

