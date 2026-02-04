import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<import("./user.entity").User>;
    findAll(): Promise<import("./user.entity").User[]>;
    findOne(id: string): Promise<import("./user.entity").User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./user.entity").User | null>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    getProfile(req: any): Promise<import("./user.entity").User | null>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("./user.entity").User | null>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        email: string;
        message: string;
    } | null>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        email: string;
    } | null>;
}
