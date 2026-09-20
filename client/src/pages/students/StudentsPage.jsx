import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStudents, deleteStudent } from '../../features/students/studentSlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination,
  LoadingScreen, ConfirmDialog, EmptyState, statusColor,
} from '../../components/common';

const StudentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, pagination, loading } = useSelector((s) => s.students);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchStudents({ page, search, department: dept }));
  }, [page, search, dept]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteStudent(deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${pagination?.total ?? 0} total students`}
        action={
          user?.role === 'admin' && (
            <Link to="/students/new" className="btn-primary flex items-center gap-2">
              <MdAdd size={18} /> Add Student
            </Link>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, email, ID..." />
        <input
          value={dept}
          onChange={(e) => { setDept(e.target.value); setPage(1); }}
          className="input-field max-w-[180px]"
          placeholder="Department"
        />
      </div>

      {loading ? <LoadingScreen /> : (
        <div className="card p-0 overflow-hidden">
          {students.length === 0 ? (
            <EmptyState
              title="No students found"
              description="Try adjusting your search filters"
              action={user?.role === 'admin' && <Link to="/students/new" className="btn-primary">Add First Student</Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">ID</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Semester</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">CGPA</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                            {s.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{s.userId?.name}</p>
                            <p className="text-xs text-gray-400">{s.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs">{s.studentId}</td>
                      <td className="table-cell">{s.department}</td>
                      <td className="table-cell">{s.semester}</td>
                      <td className="table-cell">
                        <Badge color={statusColor(s.status)}>{s.status}</Badge>
                      </td>
                      <td className="table-cell font-semibold">{s.cgpa?.toFixed(2) || '—'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/students/${s._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                            <MdVisibility size={16} />
                          </button>
                          {user?.role === 'admin' && (
                            <>
                              <button onClick={() => navigate(`/students/${s._id}/edit`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
                                <MdEdit size={16} />
                              </button>
                              <button onClick={() => setDeleteId(s._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                <MdDelete size={16} />
                              </button>
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Student"
        message="This will permanently delete the student and their account. This action cannot be undone."
      />
    </div>
  );
};

export default StudentsPage;