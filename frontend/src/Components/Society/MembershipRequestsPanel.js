import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FiCheck, FiClock, FiFileText, FiX } from "react-icons/fi";
import "./MembershipRequestsPanel.css";

const STATUS_META = {
  pending: { label: "Pending", className: "pending", icon: <FiClock /> },
  approved: { label: "Approved", className: "approved", icon: <FiCheck /> },
  rejected: { label: "Rejected", className: "rejected", icon: <FiX /> },
};

function MembershipRequestsPanel({ managerId, societyName, isActive }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingIds, setUpdatingIds] = useState({});

  useEffect(() => {
    if (!isActive || !managerId) {
      return;
    }

    let isMounted = true;

    const loadRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `http://localhost:5001/api/membership/manager/${managerId}`
        );

        if (!isMounted) {
          return;
        }

        setRequests(response.data.requests || []);
      } catch (fetchError) {
        console.error(fetchError);

        if (!isMounted) {
          return;
        }

        setError(
          fetchError.response?.data?.message ||
            "Unable to load membership requests for this manager."
        );
        setRequests([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [isActive, managerId]);

  const handleStatusUpdate = async (requestId, status) => {
    setUpdatingIds((current) => ({ ...current, [requestId]: true }));

    try {
      const response = await axios.patch(
        `http://localhost:5001/api/membership/${requestId}`,
        { status }
      );

      const updatedRequest = response.data.request;

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId || request.id === requestId
            ? updatedRequest
            : request
        )
      );
    } catch (updateError) {
      console.error(updateError);
      setError(
        updateError.response?.data?.message ||
          "Unable to update membership request status."
      );
    } finally {
      setUpdatingIds((current) => {
        const nextUpdating = { ...current };
        delete nextUpdating[requestId];
        return nextUpdating;
      });
    }
  };

  if (!managerId) {
    return (
      <div className="membership-requests-panel__empty">
        <FiFileText aria-hidden="true" />
        <h3>No manager ID available</h3>
        <p>This dashboard cannot load membership requests until the manager profile is assigned correctly.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="membership-requests-panel__state">
        <p>Loading membership requests...</p>
      </div>
    );
  }

  return (
    <div className="membership-requests-panel">
      <div className="membership-requests-panel__header">
        <div>
          <p className="membership-requests-panel__eyebrow">Membership Requests</p>
          <h3>{societyName ? `${societyName} applications` : "Incoming applications"}</h3>
          <p className="membership-requests-panel__subtitle">
            Review pending club applications and update the request status instantly.
          </p>
        </div>
        <span className="membership-requests-panel__count">{requests.length} total</span>
      </div>

      {error && <div className="membership-requests-panel__error">{error}</div>}

      {requests.length === 0 ? (
        <div className="membership-requests-panel__empty">
          <FiFileText aria-hidden="true" />
          <h3>No membership requests yet</h3>
          <p>New applications submitted for your assigned club will appear here.</p>
        </div>
      ) : (
        <div className="membership-requests-panel__list">
          {requests.map((request) => {
            const statusKey = request.status || "pending";
            const meta = STATUS_META[statusKey] || STATUS_META.pending;
            const requestId = request._id || request.id;
            const isUpdating = Boolean(updatingIds[requestId]);

            return (
              <article
                key={requestId}
                className={`membership-request-card membership-request-card--${meta.className}`}
              >
                <div className="membership-request-card__top">
                  <div>
                    <h4>{request.name}</h4>
                    <p>{request.student_id}</p>
                  </div>
                  <span className={`membership-request-card__badge membership-request-card__badge--${meta.className}`}>
                    <span aria-hidden="true">{meta.icon}</span>
                    {meta.label}
                  </span>
                </div>

                <div className="membership-request-card__meta">
                  <span>{request.faculty}</span>
                  <span>Year {request.year}</span>
                  <span>{request.email}</span>
                </div>

                <div className="membership-request-card__body">
                  <p>{request.reason}</p>
                </div>

                <div className="membership-request-card__actions">
                  <button
                    type="button"
                    className="membership-request-card__action membership-request-card__action--approve"
                    onClick={() => handleStatusUpdate(requestId, "approved")}
                    disabled={isUpdating || statusKey === "approved"}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="membership-request-card__action membership-request-card__action--reject"
                    onClick={() => handleStatusUpdate(requestId, "rejected")}
                    disabled={isUpdating || statusKey === "rejected"}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

MembershipRequestsPanel.propTypes = {
  managerId: PropTypes.string,
  societyName: PropTypes.string,
  isActive: PropTypes.bool,
};

MembershipRequestsPanel.defaultProps = {
  managerId: "",
  societyName: "",
  isActive: false,
};

export default MembershipRequestsPanel;