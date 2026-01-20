import Header from "./header";
import Footer from "./footer";

interface IProps {
    children: React.ReactNode;
    hasSidebar?: boolean;
    hideHeader?: boolean;
    hideFooter?: boolean;
    sidebarLayout?: 1 | 2;
    layout?: "app";
}

const Layout = ({
    children,
    hasSidebar,
    hideHeader,
    hideFooter,
    sidebarLayout,
}: IProps) => {
    return (
        <>
            {!hideHeader && (
                <Header hasSidebar={hasSidebar} sidebarLayout={sidebarLayout} />
            )}
            {children}
            {!hideFooter && <Footer />}
        </>
    );
};

Layout.defaultProps = {
    hideHeader: false,
    hideFooter: false,
};

export default Layout;
