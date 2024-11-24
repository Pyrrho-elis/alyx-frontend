import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export const createClient = (request) => {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name, options) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
                getAll() {
                    return request.cookies.getAll().reduce((acc, cookie) => {
                        acc[cookie.name] = cookie.value;
                        return acc;
                    }, {});
                },
                setAll(cookieStrings) {
                    cookieStrings.map(str => {
                        const [name, ...rest] = str.split('=');
                        const value = rest.join('=');
                        request.cookies.set(name, value);
                        response.cookies.set(name, value);
                    });
                }
            },
        }
    );

    return { supabase, response };
};

export const createAdminClient = () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                get: () => null,
                set: () => {},
                remove: () => {},
                getAll: () => ({}),
                setAll: () => {}
            },
            auth: {
                persistSession: false
            }
        }
    );
};
