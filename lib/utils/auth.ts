import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: { userId: string; email: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Generate password reset token
export const generateResetToken = (): string => {
  return jwt.sign({ type: 'password-reset' }, JWT_SECRET, { expiresIn: '1h' });
};

// Verify password reset token
export const verifyResetToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.type === 'password-reset';
  } catch (error) {
    return false;
  }
};
