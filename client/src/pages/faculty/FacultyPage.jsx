import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchFaculty, fetchFacultyById, createFaculty, updateFaculty, deleteFaculty,
} from '../../features/faculty/facultySlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination, LoadingScreen,
  ConfirmDialog, EmptyState, statusColor,
} from '../../components/common';

const DEPARTMENTS = ['Computer Science','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Business Administration','Mathematics','Physics','Chemistry','Biology'];

export const FacultyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { faculty, pagination, loading } = useSelector((s) => s.faculty);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchFaculty({ page, search, department: dept }));
  }, [page, search, dept]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteFaculty(deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Faculty"
        subtitle={`${pagination?.total ?? 0} total faculty`}
        action={user?.role === 'admin' && (
          <Link to="/faculty/new" className="btn-primary flex items-center gap-2">
            <MdAdd size={18} /> Add Faculty
          </Link>
        )}
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search faculty..." />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} className="input-field max-w-[200px]">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <LoadingScreen /> : (
        <div className="card p-0 overflow-hidden">
          {faculty.length === 0 ? (
            <EmptyState title="No faculty found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Faculty</th>
                    <th className="table-header">ID</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Designation</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faculty.map((f) => (
                    <tr key={f._id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
                            {f.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{f.userId?.name}</p>
                            <p className="text-xs text-gray-400">{f.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs">{f.facultyId}</td>
                      <td className="table-cell">{f.department}</td>
                      <td className="table-cell">{f.designation || '—'}</td>
                      <td className="table-cell"><Badge color={statusColor(f.status)}>{f.status}</Badge></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/faculty/${f._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><MdVisibility size={16} /></button>
                          {user?.role === 'admin' && (
                            <>
                              <button onClick={() => navigate(`/faculty/${f._id}/edit`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><MdEdit size={16} /></button>
                              <button onClick={() => setDeleteId(f._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><MdDelete size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Faculty" message="This will permanently delete the faculty member and their account." />
    </div>
  );
};

export default FacultyPage;