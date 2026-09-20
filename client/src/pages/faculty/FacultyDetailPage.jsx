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

export const FacultyDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { member, loading } = useSelector((s) => s.faculty);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchFacultyById(id)); }, [id]);

  if (loading || !member) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title="Faculty Profile" action={user?.role === 'admin' && <Link to={`/faculty/${id}/edit`} className="btn-primary">Edit</Link>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 text-3xl font-bold flex items-center justify-center mx-auto">
            {member.userId?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{member.userId?.name}</h2>
            <p className="text-gray-500 text-sm">{member.userId?.email}</p>
            <Badge color={statusColor(member.status)}>{member.status}</Badge>
          </div>
          <div className="border-t pt-3 space-y-2 text-sm text-left">
            {[['Faculty ID', member.facultyId], ['Department', member.department],
              ['Designation', member.designation||'—'], ['Qualification', member.qualification||'—'],
              ['Experience', member.experience ? `${member.experience} years` : '—'],
              ['Phone', member.phone||'—']].map(([l,v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-4">Assigned Courses</h3>
          {member.assignedCourses?.length === 0 ? (
            <p className="text-gray-400 text-sm">No courses assigned</p>
          ) : (
            <div className="space-y-2">
              {member.assignedCourses?.map(c => (
                <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.code} · {c.credits} credits</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDetailPage;