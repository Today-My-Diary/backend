export class UserService {

    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async findOrCreateUserByGoogle(googleProfile) {
        const { email, name } = googleProfile;

        // DB에서 user 정보 조회
        let user = await this.userRepository.findByEmail(email);
        if (user) {
            return user;
        }

        // 신규 user
        return await this.userRepository.create({ email: email, name: name });
    }

    async findUserById(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('유저를 찾을 수 없습니다.');
        }
        return user;
    }
}