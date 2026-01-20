import Aisde from "./aside";

interface IProps {
    aside?: "minimize";
    sidebarLayout?: 1 | 2;
    children: React.ReactNode;
}

const Layout = ({ children, aside, sidebarLayout }: IProps) => {
    return (
        <>
            <Aisde layout={aside} sidebarLayout={sidebarLayout} />
            {children}
        </>
    );
};

Layout.defaultProps = {
    sidebarLayout: 1,
};

export default Layout;
