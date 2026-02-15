import { useParams, Navigate } from "react-router-dom";

export default function ContentLibraryDetail() {
  const { id } = useParams<{ id: string }>();

  // Redirect to library with content_id param for backward compatibility
  return <Navigate to={`/biblioteca?content_id=${id || ''}`} replace />;
}
