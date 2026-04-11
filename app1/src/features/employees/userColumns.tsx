import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  EditableCell,
  CompanyTextField,
  CompanyNumberField,
  CompanyComboBox,
  CompanyCheckbox,
  CompanyRadioGroup,
  CompanyDateField,
  CompanyTimeField,
  CompanyPostalField,
  CompanyPhoneField,
  CompanyButton,
  CompanyDisplayField,
} from 'common';
import type { User } from '../../api/users';
import { gridRowSchema } from './useUserPage';

interface UseUserColumnsProps {
  updateGridData: (rowIndex: number, columnId: string, value: User[keyof User]) => void;
  handleEditClick: (row: User) => void;
}

const columnHelper = createColumnHelper<User>();

export function useUserColumns({ updateGridData, handleEditClick }: UseUserColumnsProps) {

  const DEPT_OPTIONS = useMemo(() => [
    { label: '営業部', value: 'sales' },
    { label: 'システム開発部', value: 'dev' },
    { label: '総務部', value: 'hr' },
  ], []);

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'ID',
      size: 60,
      cell: ({ getValue }) => (
        <CompanyDisplayField label="ID" value={getValue()} />
      )
    }),

    columnHelper.accessor('name', {
      header: '氏名',
      size: 160,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell 
          value={getValue()} 
          onChange={val => updateGridData(row.index, id, val)} 
          component={CompanyTextField} 
          schema={gridRowSchema.shape.name} 
        />
      )
    }),

    columnHelper.accessor('department', {
      header: '部署',
      size: 160,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell
          value={getValue()}
          onChange={val => updateGridData(row.index, id, val)}
          component={CompanyComboBox}
          options={DEPT_OPTIONS}
        />
      )
    }),

    columnHelper.accessor('isActive', {
      header: '有効',
      size: 60,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell
          value={getValue()}
          onChange={val => updateGridData(row.index, id, val)}
          component={CompanyCheckbox}
        />
      )
    }),

    columnHelper.accessor('employmentType', {
      header: '形態',
      size: 220,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell
          value={getValue()}
          onChange={val => updateGridData(row.index, id, val)}
          component={CompanyRadioGroup}
        >
          <CompanyRadioGroup.Radio value="full_time">正</CompanyRadioGroup.Radio>
          <CompanyRadioGroup.Radio value="contract">契</CompanyRadioGroup.Radio>
        </EditableCell>
      )
    }),

    columnHelper.accessor('birthDate', {
      header: '生年月日',
      size: 140,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell 
          value={getValue()} 
          onChange={val => updateGridData(row.index, id, val)} 
          component={CompanyDateField} 
          schema={gridRowSchema.shape.birthDate} 
        />
      )
    }),

    columnHelper.accessor('startTime', {
      header: '始業',
      size: 100,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell 
          value={getValue()} 
          onChange={val => updateGridData(row.index, id, val)} 
          component={CompanyTimeField} 
        />
      )
    }),

    columnHelper.accessor('postalCode', {
      header: '郵便',
      size: 110,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell
          value={getValue()}
          onChange={val => updateGridData(row.index, id, val)}
          component={CompanyPostalField}
        />
      )
    }),

    columnHelper.accessor('salary', {
      header: '基本給',
      size: 120,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell
          value={getValue()}
          onChange={val => updateGridData(row.index, id, val)}
          component={CompanyNumberField}
          textAlign="right"
          formatView={(val) => (val ? `¥${Number(val).toLocaleString()}` : '¥0')}
          schema={gridRowSchema.shape.salary}
        />
      )
    }),

    columnHelper.accessor('phoneNumber', {
      header: '電話',
      size: 140,
      cell: ({ row, getValue, column: { id } }) => (
        <EditableCell
          value={getValue()}
          onChange={val => updateGridData(row.index, id, val)}
          component={CompanyPhoneField}
        />
      )
    }),

    columnHelper.display({
      id: 'actions',
      header: '操作',
      size: 80,
      cell: ({ row }) => (
        <EditableCell
          value={null}
          onChange={() => { }}
          component={CompanyButton}
          variant="primary"
          onPress={() => handleEditClick(row.original)}
        >
          編集
        </EditableCell>
      )
    }),
  ], [updateGridData, handleEditClick, DEPT_OPTIONS]);

  return { columns, DEPT_OPTIONS };
}
