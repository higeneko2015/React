import { useState, useCallback, useEffect } from 'react';
import { useForm, zodResolver, z, useQuery } from 'common';
import { useSearchUsers } from '../../api/users';
import type { User } from '../../api/users';

// --- Validation Schemas ---
export const gridRowSchema = z.object({
  name: z.string().min(1, JSON.stringify({ code: 'E0001', args: ['氏名'] })),
  salary: z.number().min(80000, JSON.stringify({ code: 'E0005', args: ['8万'] })).nullable().optional(),
  birthDate: z.string().nullable().refine((val) => {
    if (!val) return true;
    const inputDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }, { message: JSON.stringify({ code: 'E0003', args: ['生年月日'] }) }),
});

export const formSchema = z.object({
  name: z.string().min(1, JSON.stringify({ code: 'E0001', args: ['氏名'] })),
  postalCode: z.string(),
  phoneNumber: z.string(),
  birthDate: z.string().nullable().refine((val) => {
    if (!val) return true;
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(val)) return false;
    const parts = val.split('/');
    const y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }, { message: JSON.stringify({ code: 'E0002', args: ['YYYY/MM/DD'] }) }).refine((val) => {
    if (!val) return true;
    const inputDate = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  }, { message: JSON.stringify({ code: 'E0003', args: ['生年月日'] }) }),
  startTime: z.string().nullable().refine((val) => {
    if (!val) return true;
    if (!/^\d{2}:\d{2}$/.test(val)) return false;
    const parts = val.split(':');
    const h = Number(parts[0]), m = Number(parts[1]);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }, { message: JSON.stringify({ code: 'E0004', args: ['HH:mm'] }) }),
  salary: z.number().nullable().optional(),
  department: z.string().nullable().optional(),
  employmentType: z.string(),
  isActive: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.postalCode && data.postalCode.trim() !== '' && (!data.phoneNumber || data.phoneNumber.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phoneNumber'],
      message: JSON.stringify({ code: 'E0006', args: ['郵便番号', '電話番号'] }),
    });
  }
});

export type FormDataState = z.infer<typeof formSchema>;

export function useUserPage() {
  // --- States ---
  const [searchDraft, setSearchDraft] = useState({ name: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState({ name: '', phone: '' });
  const [selectedRow, setSelectedRow] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gridData, setGridData] = useState<User[]>([]);

  // --- API / Messages ---
  const { data: messages = {} } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages');
      return res.json();
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 30,
  });

  const { data: users, isLoading } = useSearchUsers(searchQuery);

  // --- Form ---
  const methods = useForm<FormDataState>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      postalCode: '',
      phoneNumber: '',
      birthDate: null,
      startTime: null,
      salary: null,
      department: null,
      employmentType: 'full_time',
      isActive: true,
    }
  });

  // --- Callbacks ---
  const updateGridData = useCallback((rowIndex: number, columnId: string, value: User[keyof User]) => {
    setGridData(old =>
      old.map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row))
    );
  }, []);

  const handleEditClick = useCallback((row: User) => {
    setSelectedRow(row);
    methods.reset(row as any); // Type mismatch between API and Zod (null vs undefined etc)
  }, [methods]);

  const handleExecuteSearch = useCallback(() => {
    setSearchQuery(searchDraft);
  }, [searchDraft]);

  // --- Sync Effects ---
  useEffect(() => {
    if (users) {
      setGridData(users);
      setSelectedRow(null);
    }
  }, [users]);

  return {
    state: {
      searchDraft,
      selectedRow,
      isProcessing,
      gridData,
      isLoading,
      messages,
    },
    actions: {
      setSearchDraft,
      setSearchQuery,
      setIsProcessing,
      handleExecuteSearch,
      updateGridData,
      handleEditClick,
      setSelectedRow,
    },
    methods,
  };
}
