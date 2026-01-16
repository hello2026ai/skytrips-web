import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { CustomSelectField } from './ui/CustomSelectField';
import countries from '../../../../libs/src/shared-utils/constants/countries.json';
import EnglishNameExample from './EnglishNameExample';
import { authFetch } from '../utils/authFetch';
import { toast } from 'sonner';

const genders = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'UNSPECIFIED', label: 'Other' },
];

interface PassengerDetailsProps {
  me: any;
  loading: boolean;
}

const PassengerDetails: React.FC<PassengerDetailsProps> = ({ me, loading }) => {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    passport: {
      passportNumber: '',
      passportExpiryDate: '',

      passportIssueCountry: '',
    },
  });
  const [adding, setAdding] = useState(false);
  const [originalPassenger, setOriginalPassenger] = useState<any | null>(null);
  const [addPassengerErrors, setAddPassengerErrors] = useState<any>({});

  const countryOptions = countries.countries
    .map((country) => ({
      value: country.label,
      label: country.label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const today = new Date().toISOString().slice(0, 10);

  const handleChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPassengers(
      passengers.map((p) =>
        p.id === id ? { ...p, [e.target.name]: e.target.value } : p
      )
    );
  };

  const handleChangeCustom = (id: number, field: string, value: string) => {
    setPassengers(
      passengers.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleExpand = (id: number) => {
    setExpandedId(id === expandedId ? null : id);
    if (id !== expandedId) {
      const passenger = passengers[id];
      setOriginalPassenger(JSON.parse(JSON.stringify(passenger)));
    } else {
      setOriginalPassenger(null);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user-passenger/${deleteId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (!res.ok) throw new Error('Failed to delete passenger');
        toast.success('Passenger deleted successfully');
        // Refresh passenger list
        const getRes = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user-passenger`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const response = await getRes.json();
        const apiPassengers = response.data || [];
        setPassengers(apiPassengers);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to delete passenger'
        );
      }
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Fetch passengers from user-profile on mount
  useEffect(() => {
    const fetchPassengers = async () => {
      setFetching(true);
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_REST_API}/user-passenger`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const response = await res.json();
        // Get passengers from data.data array
        const apiPassengers = response.data || [];
        setPassengers(apiPassengers);
        setExpandedId(apiPassengers.length > 0 ? 0 : null);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to get passengers'
        );
        setPassengers([]);
      }
      setFetching(false);
    };
    fetchPassengers();
  }, []);

  const emptyPassenger = {
    firstName: '',
    middleName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    passport: {
      passportNumber: '',
      passportExpiryDate: '',

      passportIssueCountry: '',
    },
    isNew: true,
  };

  console.log('passengers', passengers);

  // Add update handler function
  const handleUpdate = async (passenger: any) => {
    console.log('handleUpdate called for', passenger);
    if (!originalPassenger) return;
    try {
      const { isNew, ...passengerData } = passenger;
      const { isNew: _, ...originalData } = originalPassenger;
      const payload: any = {};

      // Check top-level fields
      for (const key of Object.keys(passengerData)) {
        if (key === 'passport') continue;
        if (passengerData[key] !== originalData[key]) {
          payload[key] = passengerData[key];
        }
      }
      // Check passport object
      if (
        JSON.stringify(passengerData.passport) !==
        JSON.stringify(originalData.passport)
      ) {
        payload.passport = passengerData.passport;
      }
      // Always sync country with passportIssueCountry if passport is present
      if (payload.passport) {
        payload.country = passengerData.passport.passportIssueCountry;
      }
      // Always send relationship and gender as uppercase if present
      if (payload.relationship) {
        payload.relationship = payload.relationship.toLowerCase();
      }
      if (payload.gender) {
        payload.gender = payload.gender.toUpperCase();
      }

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to update');
        return;
      }

      console.log('PATCH payload:', payload);

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/user-passenger/${passenger.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      console.log('PATCH response:', res);
      if (!res.ok) throw new Error('Failed to update passenger');
      toast.success('Passenger updated successfully');

      // Fetch updated passenger list
      const getRes = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/user-passenger`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const response = await getRes.json();
      const apiPassengers = response.data || [];
      setPassengers(apiPassengers);
      setExpandedId(null);
      setOriginalPassenger(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update passenger'
      );
    }
  };

  return (
    <div className="text-background-on">
      <div className="bg-container rounded-md shadow p-4 md:p-8 mb-6">
        <h2 className="h4 font-bold mb-1">Passenger Details</h2>
        <p className="text-neutral-dark label-l2 mb-6">
          Manage passenger information for faster booking
        </p>
        {fetching ? (
          <div>Loading...</div>
        ) : (
          <>
            {passengers.map((p, idx) => (
              <div key={p.id || idx} className="mb-2 border rounded-md">
                <div
                  className={`flex items-center justify-between bg-container rounded px-2 py-2 cursor-pointer`}
                  onClick={() => handleExpand(idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full p-2">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12Zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <div>
                      <div className="title-t4 ">
                        {p.firstName || p.givenNames || 'New Passenger'}{' '}
                        {p.lastName || ''}
                        {p.primary && (
                          <span className="ml-2 bg-blue-100 text-primary label-l3 px-2 py-0.5 rounded-xl">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="label-l3 text-neutral-dark">
                        {p.relationship}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-red-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      title="Delete Passenger"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                    <span
                      className="ml-2 transition-transform"
                      style={{
                        transform:
                          expandedId === idx
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                      }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </div>
                {expandedId === idx &&
                  (p.isNew ? (
                    <form
                      className="bg-white rounded-b-xl px-4 pt-6 pb-4 border-t"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        // Validation for required fields
                        const requiredFields = [
                          {
                            key: 'firstName',
                            value: p.firstName,
                            label: 'Given Name',
                          },
                          {
                            key: 'lastName',
                            value: p.lastName,
                            label: 'Last Name',
                          },
                          {
                            key: 'dateOfBirth',
                            value: p.dateOfBirth,
                            label: 'Date of Birth',
                          },
                          { key: 'gender', value: p.gender, label: 'Gender' },
                          {
                            key: 'passportNumber',
                            value: p.passport.passportNumber,
                            label: 'Passport Number',
                          },
                          {
                            key: 'passportExpiryDate',
                            value: p.passport.passportExpiryDate,
                            label: 'Passport Expiry',
                          },

                          {
                            key: 'passportIssueCountry',
                            value: p.passport.passportIssueCountry,
                            label: 'Passport Issue Country',
                          },
                        ];
                        const errors: any = {};
                        requiredFields.forEach((f) => {
                          if (!f.value || f.value.trim() === '') {
                            errors[f.key] = `${f.label} is required`;
                          }
                        });
                        // Date of Birth must be in the past
                        if (p.dateOfBirth) {
                          const today = new Date().toISOString().slice(0, 10);
                          if (p.dateOfBirth >= today) {
                            errors.dateOfBirth =
                              'Date of Birth must be in the past';
                          }
                        }
                        // Passport Expiry must be today or in the future
                        if (p.passport.passportExpiryDate) {
                          const today = new Date().toISOString().slice(0, 10);
                          if (p.passport.passportExpiryDate < today) {
                            errors.passportExpiryDate =
                              'Passport Expiry must be today or in the future';
                          }
                        }
                        setAddPassengerErrors(errors);
                        if (Object.keys(errors).length > 0) {
                          return;
                        }
                        setAdding(true);
                        try {
                          const { isNew, ...passengerData } = p;
                          const payload = {
                            ...passengerData,
                            country: p.passport.passportIssueCountry,
                            relationship: p.relationship.toLowerCase(),
                            gender: p.gender.toUpperCase(),
                          };

                          const res = await authFetch(
                            `${process.env.NEXT_PUBLIC_REST_API}/user-passenger`,
                            {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload),
                            }
                          );
                          if (!res.ok)
                            throw new Error('Failed to add passenger');

                          toast.success('Passenger added successfully');

                          const getRes = await authFetch(
                            `${process.env.NEXT_PUBLIC_REST_API}/user-passenger`,
                            {
                              method: 'GET',
                              headers: { 'Content-Type': 'application/json' },
                            }
                          );
                          const response = await getRes.json();
                          const apiPassengers = response.data || [];
                          setPassengers(apiPassengers);
                          setExpandedId(null);
                          setAddPassengerErrors({});
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : 'Failed to add passenger'
                          );
                        }
                        setAdding(false);
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block label-l2 mb-1">
                            Given Name
                          </label>
                          <input
                            name="firstName"
                            value={p.firstName}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, firstName: e.target.value }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => {
                                if (prev.firstName) {
                                  const { firstName, ...rest } = prev;
                                  return rest;
                                }
                                return prev;
                              });
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.firstName
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="Given name"
                          />
                          {addPassengerErrors.firstName && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.firstName}
                            </div>
                          )}
                        </div>
                        {/* <div>
                          <label className="block label-l2 mb-1">
                            Middle Name
                          </label>
                          <input
                            name="middleName"
                            value={p.middleName}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, middleName: e.target.value }
                                    : item
                                )
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          />
                        </div> */}
                        <div>
                          <label className="block label-l2 mb-1">
                            Last Name
                          </label>
                          <input
                            name="lastName"
                            value={p.lastName}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, lastName: e.target.value }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => ({
                                ...prev,
                                lastName: e.target.value ? '' : prev.lastName,
                              }));
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.lastName
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                          {addPassengerErrors.lastName && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.lastName}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Relationship
                          </label>
                          <input
                            type="text"
                            name="relationship"
                            value={p.relationship}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, relationship: e.target.value }
                                    : item
                                )
                              )
                            }
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.relationship
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="Enter relationship"
                          />
                          {addPassengerErrors.relationship && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.relationship}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={p.dateOfBirth}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, dateOfBirth: e.target.value }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => ({
                                ...prev,
                                dateOfBirth: e.target.value
                                  ? ''
                                  : prev.dateOfBirth,
                              }));
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.dateOfBirth
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="mm/dd/yyyy"
                            max={today}
                          />
                          {addPassengerErrors.dateOfBirth && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.dateOfBirth}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">Gender</label>
                          <select
                            name="gender"
                            value={p.gender}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, gender: e.target.value }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => ({
                                ...prev,
                                gender: e.target.value ? '' : prev.gender,
                              }));
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.gender ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="">Select Gender</option>
                            {genders.map((g) => (
                              <option key={g.value} value={g.value}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                          {addPassengerErrors.gender && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.gender}
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="title-t4 font-semibold mb-2 mt-2">
                        Passport Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block label-l2 mb-1">
                            Passport Number
                          </label>
                          <input
                            name="passportNumber"
                            value={p.passport?.passportNumber || ''}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        passport: {
                                          ...item.passport,
                                          passportNumber: e.target.value,
                                        },
                                      }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => ({
                                ...prev,
                                passportNumber: e.target.value
                                  ? ''
                                  : prev.passportNumber,
                              }));
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.passportNumber
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                          {addPassengerErrors.passportNumber && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.passportNumber}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Passport Expiry
                          </label>
                          <input
                            type="date"
                            name="passportExpiryDate"
                            value={p.passport?.passportExpiryDate || ''}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        passport: {
                                          ...item.passport,
                                          passportExpiryDate: e.target.value,
                                        },
                                      }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => ({
                                ...prev,
                                passportExpiryDate: e.target.value
                                  ? ''
                                  : prev.passportExpiryDate,
                              }));
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.passportExpiryDate
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="mm/dd/yyyy"
                            min={today}
                          />
                          {addPassengerErrors.passportExpiryDate && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.passportExpiryDate}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Passport Issue Country
                          </label>
                          <select
                            name="passportIssueCountry"
                            value={p.passport?.passportIssueCountry || ''}
                            onChange={(e) => {
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        passport: {
                                          ...item.passport,
                                          passportIssueCountry: e.target.value,
                                        },
                                      }
                                    : item
                                )
                              );
                              setAddPassengerErrors((prev: any) => ({
                                ...prev,
                                passportIssueCountry: e.target.value
                                  ? ''
                                  : prev.passportIssueCountry,
                              }));
                            }}
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.passportIssueCountry
                                ? 'border-red-500'
                                : ''
                            }`}
                          >
                            <option value="">
                              Select Passport Issue Country
                            </option>
                            {countryOptions.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          {addPassengerErrors.passportIssueCountry && (
                            <div className="text-red-500 text-xs mt-1">
                              {addPassengerErrors.passportIssueCountry}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded border label-l1 hover:bg-[#d9d9d9]"
                          onClick={() => {
                            setPassengers((list) =>
                              list.filter((_, i) => i !== idx)
                            );
                            setExpandedId(null);
                          }}
                          disabled={adding}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded bg-primary text-secondary-on label-l1 hover:bg-[#5143d9] flex items-center gap-2"
                          disabled={adding}
                        >
                          {adding ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form
                      className="bg-white rounded-b-xl px-4 pt-6 pb-4 border-t"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdate(p);
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block label-l2 mb-1">
                            Given Name
                          </label>
                          <input
                            name="firstName"
                            value={p.firstName}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, firstName: e.target.value }
                                    : item
                                )
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        {/* <div>
                          <label className="block label-l2 mb-1">
                            Middle Name
                          </label>
                          <input
                            name="middleName"
                            value={p.middleName}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, middleName: e.target.value }
                                    : item
                                )
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          />
                        </div> */}
                        <div>
                          <label className="block label-l2 mb-1">
                            Last Name
                          </label>
                          <input
                            name="lastName"
                            value={p.lastName}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, lastName: e.target.value }
                                    : item
                                )
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Relationship
                          </label>
                          <input
                            type="text"
                            name="relationship"
                            value={p.relationship}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, relationship: e.target.value }
                                    : item
                                )
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter relationship"
                          />
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={p.dateOfBirth}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, dateOfBirth: e.target.value }
                                    : item
                                )
                              )
                            }
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.dateOfBirth
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="mm/dd/yyyy"
                            max={today}
                          />
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">Gender</label>
                          <select
                            name="gender"
                            value={p.gender}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? { ...item, gender: e.target.value }
                                    : item
                                )
                              )
                            }
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.gender ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="">Select Gender</option>
                            {genders.map((g) => (
                              <option key={g.value} value={g.value}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <h4 className="title-t4 font-semibold mb-2 mt-2">
                        Passport Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block label-l2 mb-1">
                            Passport Number
                          </label>
                          <input
                            name="passportNumber"
                            value={p.passport?.passportNumber || ''}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        passport: {
                                          ...item.passport,
                                          passportNumber: e.target.value,
                                        },
                                      }
                                    : item
                                )
                              )
                            }
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Passport Expiry
                          </label>
                          <input
                            type="date"
                            name="passportExpiryDate"
                            value={p.passport?.passportExpiryDate || ''}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        passport: {
                                          ...item.passport,
                                          passportExpiryDate: e.target.value,
                                        },
                                      }
                                    : item
                                )
                              )
                            }
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.passportExpiryDate
                                ? 'border-red-500'
                                : ''
                            }`}
                            placeholder="mm/dd/yyyy"
                            min={today}
                          />
                        </div>
                        <div>
                          <label className="block label-l2 mb-1">
                            Passport Issue Country
                          </label>
                          <select
                            name="passportIssueCountry"
                            value={p.passport?.passportIssueCountry || ''}
                            onChange={(e) =>
                              setPassengers((list) =>
                                list.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        passport: {
                                          ...item.passport,
                                          passportIssueCountry: e.target.value,
                                        },
                                      }
                                    : item
                                )
                              )
                            }
                            className={`w-full border rounded px-3 py-2 ${
                              addPassengerErrors.passportIssueCountry
                                ? 'border-red-500'
                                : ''
                            }`}
                          >
                            <option value="">
                              Select Passport Issue Country
                            </option>
                            {countryOptions.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded border label-l1 hover:bg-[#d9d9d9]"
                          onClick={() => setExpandedId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded bg-primary text-secondary-on label-l1 hover:bg-[#5143d9]"
                        >
                          Update
                        </button>
                      </div>
                    </form>
                  ))}
              </div>
            ))}
            <div className="flex justify-end items-center mb-2">
              <button
                className="flex justify-end items-center gap-2 px-3 bg-primary text-secondary-on label-l1 hover:bg-[#5143d9] py-2 rounded-md"
                onClick={() => {
                  setPassengers((prev) => {
                    const newList = [
                      ...prev,
                      {
                        ...emptyPassenger,
                        passport: {
                          passportNumber: '',
                          passportExpiryDate: '',
                          passportIssueCountry: '',
                        },
                      },
                    ];
                    setExpandedId(newList.length - 1);
                    return newList;
                  });
                }}
                disabled={passengers.some((p) => p.isNew)}
              >
                Add New Passenger
              </button>
            </div>
          </>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 text-background-on">
          <div className="bg-container rounded-xl shadow-lg p-8 max-w-md w-full">
            <h3 className="h5 mb-1">Delete Passenger</h3>
            <p className="label-l2 mb-6">
              Are you sure you want to delete this passenger?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border label-l1 hover:bg-[#d9d9d9]"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-primary text-secondary-on label-l1 hover:bg-[#5143d9]"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <EnglishNameExample />
    </div>
  );
};

export default PassengerDetails;
