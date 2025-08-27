import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import LayoutComponent from './demo/LayoutComponent.vue';

describe('layout example', () => {
  it('should mount component properly', () => {
    // Mock ResizeObserver specifically for this test
    const mockResizeObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Replace the global mock for this test
    global.ResizeObserver = mockResizeObserver;
    window.ResizeObserver = mockResizeObserver;
    
    const wrapper = mount(LayoutComponent);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'q-header' })).toBeTruthy();
    expect(wrapper.findComponent({ name: 'q-footer' })).toBeTruthy();
  });
});
