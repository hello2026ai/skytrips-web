import { useEffect, useState } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import './styles.scss';

const TimePicker = ({
  register,
  setValue,
  watch,
  error,
  clearErrors,
  hourValue,
  setHourValue,
  minuteValue,
  setMinuteValue,
}) => {
  const period = watch('period', 'AM');
  console.log('timer picker called');
  useEffect(() => {
    if (hourValue && minuteValue) {
      setValue(
        'preferedTime',
        `${hourValue}:${minuteValue ? minuteValue : ''} ${period}`,
      );
    }
  }, [hourValue, minuteValue, period, setValue]);

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-2">
        {/* Hour Selector */}
        <div>
          <input
            type="number"
            {...register('hour')}
            className="border p-2 rounded time-input"
            min="1"
            max="12"
            maxLength={2}
            value={hourValue}
            onChange={(e) => {
              let val = e.target.value;
              val = val.replace(/\D/g, '').slice(0, 2);
              if (val !== '' && Number(val) > 12) val = '12';

              setHourValue(val);
            }}
          />
        </div>

        <span className="time-dot">:</span>

        <input
          type="number"
          {...register('minute')}
          className="border p-2 rounded time-input "
          maxLength={2}
          value={minuteValue}
          onChange={(e) => {
            let val = e.target.value;
            val = val.replace(/\D/g, '').slice(0, 2);

            if (val && Number(val) > 60) val = '59';
            setMinuteValue(val);
          }}
        />

        <div className="d-flex flex-column  w-16 time-btn-container">
          <button
            type="button"
            className={`px-3 pt-1 time-btn ${
              watch('period') === 'AM' ? 'active' : ''
            }`}
            onClick={() => {
              setValue('period', 'AM');
              clearErrors('period');
            }}
          >
            AM
          </button>

          <button
            type="button"
            className={`px-3 time-btn pb-1 ${
              watch('period') === 'PM' ? 'active' : ''
            }`}
            onClick={() => {
              setValue('period', 'PM');
              clearErrors('period');
            }}
          >
            PM
          </button>
        </div>
      </div>
      {error?.period && <p className="error-message">{error.period.message}</p>}
      {error?.hour && <p className="error-message">{error.hour.message}</p>}
    </>
  );
};

export default TimePicker;
