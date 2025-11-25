
        // Edit user - open modal with user data
        async function editUser(userId) {
            try {
                const response = await fetch(`${API_URL}/admin/users/${userId}`);
                const result = await response.json();

                if (!result.success) {
                    alert('Error loading user data');
                    return;
                }

                const user = result.data;

                const modalHtml = `
                    <div id="editUserModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                        <div style="background: white; padding: 30px; border-radius: 12px; width: 500px; max-width: 90%;">
                            <h2 style="margin-bottom: 20px; color: #333;">Edit User</h2>
                            <form id="editUserForm">
                                <input type="hidden" id="editUserId" value="${user._id || user.id}">
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                                    <input type="text" id="editUserName" value="${user.name || ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email</label>
                                    <input type="email" id="editUserEmail" value="${user.email || ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Phone</label>
                                    <input type="text" id="editUserPhone" value="${user.phone || ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Role</label>
                                    <select id="editUserRole" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                        <option value="agent" ${user.role === 'agent' ? 'selected' : ''}>Agent</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">New Password (leave empty to keep current)</label>
                                    <input type="password" id="editUserPassword" placeholder="Enter new password" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                                </div>
                                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                    <button type="button" onclick="closeEditUserModal()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                                    <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHtml);
                document.getElementById('editUserForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await saveUserChanges();
                });
            } catch (error) {
                console.error('Error loading user:', error);
                alert('Error loading user data');
            }
        }

        function closeEditUserModal() {
            const modal = document.getElementById('editUserModal');
            if (modal) modal.remove();
        }

        async function saveUserChanges() {
            const userId = document.getElementById('editUserId').value;
            const role = document.getElementById('editUserRole').value;
            const password = document.getElementById('editUserPassword').value;

            try {
                await fetch(`${API_URL}/admin/users/${userId}/role`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role })
                });

                if (password) {
                    await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newPassword: password })
                    });
                }

                alert('User updated successfully!');
                closeEditUserModal();
                loadUsers();
            } catch (error) {
                console.error('Error saving user:', error);
                alert('Error saving user changes');
            }
        }
