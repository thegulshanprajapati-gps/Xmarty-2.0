import MediaLibraryShell from '@/components/media/MediaLibraryShell';

export const metadata = {
  title: 'Recycle Bin',
  description: 'Restore or permanently delete media assets.',
};

export default function AssetRecycleBinPage() {
  return <MediaLibraryShell initialMode="recycle" />;
}
