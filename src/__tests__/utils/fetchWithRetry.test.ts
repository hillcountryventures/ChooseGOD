import { fetchWithRetry } from '../../utils/fetchWithRetry';

describe('fetchWithRetry', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await fetchWithRetry(fn, { maxAttempts: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const result = await fetchWithRetry(fn, { maxAttempts: 3 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  }, 15000);

  it('throws after all attempts exhausted', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fail'));

    await expect(
      fetchWithRetry(fn, { maxAttempts: 2 })
    ).rejects.toThrow('always fail');
    expect(fn).toHaveBeenCalledTimes(2);
  }, 15000);

  it('calls onRetry callback', async () => {
    const onRetry = jest.fn();
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('err'))
      .mockResolvedValue('ok');

    await fetchWithRetry(fn, { maxAttempts: 3, onRetry });
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  }, 15000);

  it('passes AbortSignal to fn', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await fetchWithRetry(fn);
    expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal));
  });
});
