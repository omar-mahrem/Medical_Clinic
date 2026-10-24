using MedicalClinic.Application.Contract.User;

namespace MedicalClinic.Application.Services;

public class UserServices(
    UserManager<ApplicationUser> userManager,
    IApplicationDbContext context,
    IRoleServices roleServices) : IUserServices
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly IApplicationDbContext _context = context;
    private readonly IRoleServices _roleServices = roleServices;

    public async Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await (from u in _context.Users.IgnoreQueryFilters()
               join ur in _context.UserRoles
               on u.Id equals ur.UserId
               join r in _context.Roles
               on ur.RoleId equals r.Id into roles
               select new
               {
                   u.Id,
                   u.FirstName,
                   u.LastName,
                   u.Email,
                   u.IsDeleted,
                   IsLocked = u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTimeOffset.UtcNow,
                   Roles = roles.Select(x => x.Name!).ToList()
               }
                )
                .GroupBy(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.IsDeleted, u.IsLocked })
                .Select(u => new UserResponse
                (
                    u.Key.Id,
                    u.Key.FirstName,
                    u.Key.LastName,
                    u.Key.Email,
                    u.Key.IsDeleted,
                    u.Key.IsLocked,
                    u.SelectMany(x => x.Roles)
                ))
               .ToListAsync(cancellationToken);
    public async Task<Result<UserResponse>> GetAsync(string userId)
    {
        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null)
            return Result.Failure<UserResponse>(UserErrors.UserNotFounded);

        var userRoles = await _userManager.GetRolesAsync(user);
        var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;

        var response = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email!, user.IsDeleted, isLocked, userRoles);

        return Result.Success(response);
    }

    public async Task<Result<UserResponse>> AddAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var emailIsExists = await _userManager.Users.IgnoreQueryFilters().AnyAsync(x => x.Email == request.Email, cancellationToken);

        if (emailIsExists)
            return Result.Failure<UserResponse>(UserErrors.DuplicatedEmail);

        var allowedRoles = await _roleServices.GetAllAsync(cancellationToken: cancellationToken);

        if (request.Roles.Except(allowedRoles.Select(x => x.Name)).Any())
            return Result.Failure<UserResponse>(UserErrors.InvalidRoles);

        var user = request.Adapt<ApplicationUser>();
        user.UserName = request.Email;
        user.EmailConfirmed = true;
        user.CreatedAt = DateTime.UtcNow;
        user.PhoneNumber = !string.IsNullOrWhiteSpace(request.PhoneNumber) ? request.PhoneNumber : "01000000000";

        var result = await _userManager.CreateAsync(user, request.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRolesAsync(user, request.Roles);

            var response = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email!, user.IsDeleted, false, request.Roles);

            return Result.Success(response);
        }

        var error = result.Errors.First();

        return Result.Failure<UserResponse>(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> UpdateAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var emailIsExists = await _userManager.Users.IgnoreQueryFilters().AnyAsync(x => x.Email == request.Email && x.Id != id, cancellationToken);

        if (emailIsExists)
            return Result.Failure(UserErrors.DuplicatedEmail);

        var allowedRoles = await _roleServices.GetAllAsync(cancellationToken: cancellationToken);

        if (request.Roles.Except(allowedRoles.Select(x => x.Name)).Any())
            return Result.Failure(UserErrors.InvalidRoles);

        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
            return Result.Failure(UserErrors.UserNotFounded);

        user = request.Adapt(user);

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            await _context.UserRoles
                .Where(x => x.UserId == id)
                .ExecuteDeleteAsync(cancellationToken);

            await _userManager.AddToRolesAsync(user, request.Roles);

            return Result.Success();
        }

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> ToggleStatus(string id)
    {
        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (user is null)
            return Result.Failure(UserErrors.UserNotFounded);

        user.IsDeleted = !user.IsDeleted;

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
            return Result.Success();

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> Unlock(string id)
    {
        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (user is null)
            return Result.Failure(UserErrors.UserNotFounded);

        var result = await _userManager.SetLockoutEndDateAsync(user, null);

        if (result.Succeeded)
            return Result.Success();

        var error = result.Errors.First();

        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result<UserProfileResponse>> GetProfileAsync(string userId)
    {
        var user = await _userManager.Users
            .Where(u => u.Id == userId)
            .SingleAsync();

        return Result.Success(user.Adapt<UserProfileResponse>());
    }

    public async Task<Result> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        //var user = await _userManager.FindByIdAsync(userId);
        //user = request.Adapt(user);
        //await _userManager.UpdateAsync(user!);

        await _userManager.Users
            .Where(u => u.Id == userId)
            .ExecuteUpdateAsync(setter =>
                setter
                    .SetProperty(x => x.FirstName, request.FirstName)
                    .SetProperty(x => x.MiddleName, request.MiddleName)
                    .SetProperty(x => x.LastName, request.LastName)
                    .SetProperty(x => x.PhoneNumber, request.PhoneNumber)
                    .SetProperty(x => x.DateOfBirth, request.DateOfBirth)
            );

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);

        var result = await _userManager.ChangePasswordAsync(user!, request.CurrentPassword, request.NewPassword);

        if (result.Succeeded)
            return Result.Success();

        var error = result.Errors.First();
        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }

    public async Task<Result> ResetPasswordByAdminAsync(string userId, string newPassword)
    {
        if (await _userManager.FindByIdAsync(userId) is not { } user)
            return Result.Failure(UserErrors.UserNotFounded);

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        if (result.Succeeded)
        {
            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }
            return Result.Success();
        }

        var error = result.Errors.First();
        return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
    }
}
