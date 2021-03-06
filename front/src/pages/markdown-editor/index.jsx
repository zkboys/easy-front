import React, { useEffect } from 'react';
import Editor from 'rich-markdown-editor';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { usePost } from '@/commons/ajax';

export default config({ path: '/markdown' })(props => {
    const { uploadUrl = '/upload' } = props;

    const [ , upload ] = usePost(uploadUrl);

    async function handleUploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        return await upload(formData);
    }

    useEffect(() => {
    }, []);

    return (
        <PageContent>
            <Editor
                uploadImage={handleUploadImage}
                {...props}
            />
        </PageContent>
    );
});
