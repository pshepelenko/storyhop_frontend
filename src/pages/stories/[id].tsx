import type { GetServerSideProps } from 'next';

export default function LegacyStoryRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/library',
    permanent: false,
  },
});
