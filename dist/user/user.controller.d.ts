import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    getProfile(req: any): Promise<User | null>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<User | null>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        emailProfessionnel: string;
        message: string;
    } | null>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        emailProfessionnel: string;
    } | null>;
}
