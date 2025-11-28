const fs = require('fs');

let html = fs.readFileSync('public/admin/index.html', 'utf8');

// Update button styles - simpler design with text
const oldButtonStyles = `        .action-btn {
            padding: 8px 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            margin-right: 4px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 34px;
            height: 34px;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .action-btn i {
            font-size: 14px;
        }

        .view-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .view-btn:hover {
            background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
        }

        .edit-btn {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .edit-btn:hover {
            background: linear-gradient(135deg, #0e8377 0%, #2ed96c 100%);
        }

        .delete-btn {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            color: white;
        }

        .delete-btn:hover {
            background: linear-gradient(135deg, #d42a3f 0%, #e04d36 100%);
        }

        .action-buttons {
            display: flex;
            gap: 6px;
            justify-content: flex-start;
        }`;

const newButtonStyles = `        .action-btn {
            padding: 5px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .action-btn:hover {
            opacity: 0.85;
        }

        .action-btn i {
            font-size: 12px;
        }

        .view-btn {
            background: #6366f1;
            color: white;
        }

        .edit-btn {
            background: #3b82f6;
            color: white;
        }

        .delete-btn {
            background: #ef4444;
            color: white;
        }

        .action-buttons {
            display: flex;
            gap: 5px;
            justify-content: flex-start;
        }`;

html = html.replace(oldButtonStyles, newButtonStyles);

// Update button HTML to include text
const oldButtonHtml = `<div class="action-buttons"><button class="action-btn view-btn" onclick="viewDestination(\\'' + dest.slug + '\\')" title="View"><i class="fas fa-eye"></i></button><button class="action-btn edit-btn" onclick="editDestination(\\'' + dest._id + '\\')" title="Edit"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteDestination(\\'' + dest._id + '\\')" title="Delete"><i class="fas fa-trash"></i></button></div>`;

const newButtonHtml = `<div class="action-buttons"><button class="action-btn view-btn" onclick="viewDestination(\\'' + dest.slug + '\\')"><i class="fas fa-eye"></i> View</button><button class="action-btn edit-btn" onclick="editDestination(\\'' + dest._id + '\\')"><i class="fas fa-edit"></i> Edit</button><button class="action-btn delete-btn" onclick="deleteDestination(\\'' + dest._id + '\\')"><i class="fas fa-trash"></i> Delete</button></div>`;

html = html.split(oldButtonHtml).join(newButtonHtml);

fs.writeFileSync('public/admin/index.html', html);
console.log('Buttons updated with text labels!');
