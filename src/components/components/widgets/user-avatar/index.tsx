import { Avatar } from "@doar/components";
import image from "@doar/shared/images/img16.jpg";

const UserAvatar = () => {
    return (
        <Avatar size="xxl" status="online">
            <img src={image} alt="user" />
        </Avatar>
    );
};

export default UserAvatar;
