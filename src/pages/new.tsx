import type { GetServerSideProps } from 'next';

export default function LegacyNewStoryRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/seasons/new',
    permanent: false,
  },
});
