export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  prompt?: string;
  style?: string;
  input_image_path?: string;
  result_image_path?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
