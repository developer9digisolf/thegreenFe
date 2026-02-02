import { GetServerSideProps } from "next";

// Redirect /green-spa to /green-spa/pos
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/green-spa/pos",
      permanent: false,
    },
  };
};

const GreenSpaIndex = () => null;
export default GreenSpaIndex;
