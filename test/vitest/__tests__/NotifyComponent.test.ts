import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';
import NotifyComponent from './demo/NotifyComponent.vue';

describe('notify example', () => {
  it('should call notify on click', async () => {
    expect(NotifyComponent).toBeTruthy();

    // Mock Notify.create function
    const mockCreate = vi.fn();
    vi.mocked(Notify).create = mockCreate;
    
    const wrapper = mount(NotifyComponent);
    expect(mockCreate).not.toHaveBeenCalled();
    
    // Click the button to trigger notify
    await wrapper.find('button').trigger('click');
    
    expect(mockCreate).toHaveBeenCalledWith('Hello there!');
  });
});
